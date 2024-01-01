from flask import Flask, request, jsonify
import sqlite3
from flask_cors import CORS
import numpy as np
from datetime import datetime
import os
from pathlib import Path
from PIL import Image

app = Flask(__name__)

CORS(app) 

# Build paths inside the project like this: BASE_DIR / 'subdir'.
#BASE_DIR = Path(__file__).resolve(strict=True).parent.parent

MEDIA_FOLDER = "/media"

# if not os.path.exists(MEDIA_FOLDER):
#     os.makedirs(MEDIA_FOLDER)


# MEDIA_ROOT = os.path.join(BASE_DIR, MEDIA_FOLDER)

MEDIA_URL = "/media/"

@app.route('/generate_zpl', methods=['POST'])
def generate_zpl():
    start = "^XA"
    end = "^XZ"
    label_pos = "^FT"
    label_text_tag = "^FD" 
    change_font = "^CFA,30"
    start_of_field ="^FO"
    end_of_field = "^FS"
    data = request.get_json()
    print("****************************************",data)

    input_labels = data['input_labels']
    text_values_co_ords = data['text_values_co_ords']

    input_qr_code = data['input_qr_code']
    input_barcode = data['input_barcode']
    
    barcode_cords = data['barcode_cords']
    qr_code_cords = data['qr_code_cords']

    line_co_ordinates = data['line_co_ordinates']
    
    rect_co_ordinates = data['rect_co_ordinates']
    font_size = data['font_size']

    font_weight = data['fontweight_array']
    
    image_data = data['image_data']

    #save_var_list("label1",input_labels)

    code = []
    
    code.append(start)
    
    input_text_x = []
    input_text_y = []
    input_label_x  = []
    input_label_y = []
    
    line_coordinates_x1 = []
    line_coordinates_y1 = []
    line_coordinates_x2 = []
    line_coordinates_y2 = []
    line_angle = []

    for item in line_co_ordinates:
        if(item is not None):
            line_coordinates_x1.append(item['x1'])
            line_coordinates_y1.append(item['y1'])
            line_coordinates_x2.append(item['x2'])
            line_coordinates_y2.append(item['y2'])
            line_angle.append(item['angle'])

    text_cords_x1 = []
    text_cords_y1 = []

    for item in text_values_co_ords:
        if(item is not None):
            text_cords_x1.append(item['x1'])
            text_cords_y1.append(item['y1'])
    
    font_style =[]
    for num in range(0, len(input_labels)):
        if(font_weight[num]=='bold'):
            font_style.append('^CF0')
        else:
            font_style.append('^AN')

    for num in range(0, len(input_labels)):
        total_var =font_style[num]+','+str(font_size[num])+ start_of_field +str(text_cords_x1[num])+","+str(text_cords_y1[num])+label_text_tag+input_labels[num]+end_of_field
        code.append(total_var)
    
    for num in range(0,len(line_coordinates_x1)):
        if(line_angle[num]>0 and line_angle[num]<175 or line_angle[num]>263 and line_angle[num]<280):
            line = "^FO" + str(line_coordinates_x1[num]) + "," + str(line_coordinates_y1[num]) + "^GB"+"1," +str(line_coordinates_x2[num]) +"^FS"
            code.append(line)
        else:
            line = "^FO" + str(line_coordinates_x1[num]) + "," + str(line_coordinates_y1[num]) + "^GB"+ str(line_coordinates_x2[num]) + ",1" +"^FS" 
            code.append(line)
    
    line_coordinates_rect_x1 = []
    line_coordinates_rect_x2 = []
    line_coordinates_rect_y1 = []
    line_coordinates_rect_y2 = []

    for item in rect_co_ordinates:
        if(item is not None):
            print(item)
            line_coordinates_rect_x1.append(item['x1'])
            line_coordinates_rect_x2.append(item['x2'])
            line_coordinates_rect_y1.append(item['y1'])
            line_coordinates_rect_y2.append(item['y2'])
    
    for num in range(0,len(line_coordinates_rect_x1)):
        rectangle = "^FO" + str(line_coordinates_rect_x1[num]) + "," + str(line_coordinates_rect_y1[num]) + "^GB" + str(line_coordinates_rect_x2[num]) + "," + str(line_coordinates_rect_y2[num]) + "^FS"
        code.append(rectangle)

    barcode_cords_x1 = ''
    barcode_cords_y1 = ''
    barcode_cords_width = ''

    for item in barcode_cords:
        if(item is not None):
            barcode_cords_x1 = item['x1']
            barcode_cords_y1 = item['y1']
            barcode_cords_width = item['width']
    
    qr_code_cords_x1 = ''
    qr_code_cords_y1 = ''

    for item in qr_code_cords:
        if(item is not None):
            qr_code_cords_x1 = item['x1']
            qr_code_cords_y1 = item['y1']

    if input_barcode!=' ' and  input_barcode:
        #zpl with barcode
        print("********************************************",input_barcode)
        barcode =  "^FO"+str(barcode_cords_x1)+","+str(barcode_cords_y1)+"^BY3" + "^BCN,"+str(barcode_cords_width)+",Y,N,N" + input_barcode +"^FS"
        code.append(barcode)
    elif input_qr_code!=' ' and  input_qr_code:
        qr_code =  "^FO"+str(qr_code_cords_x1)+","+str(qr_code_cords_y1)+"^BQN,2,3 ^FDMM00"+ input_qr_code +"^FS"
        code.append(qr_code)
    else:
        #zpl without qr barcode
        pass

    logo_flag = data['logo_flag']
    img_x1 = 0
    img_y1 = 0

    for item in image_data:
        if(item is not None):
            img_x1 = item['x1']
            img_y1 = item['y1']
    
    #start
    zpl_command =''
    if(logo_flag==True):
        image = Image.open(data['file_path'])
        print("filepath",data['file_path'])
        width = 200  # Desired width in dots
        height = 200  # Desired height in dots
        image = image.resize((width, height), Image.ANTIALIAS)

        # Convert the image to grayscale
        image = image.convert('L')
        image = image.point(lambda x: 0 if x >= 128 else 1, '1')

        # Initialize the ZPL command string
        zpl_command = "^FO"+str(img_x1)+","+str(img_y1)+"^GFA,{0},{1},{2},".format(
            width, height*25, width // 8
        )

        # Convert the image data to ZPL format
        for y in range(0, height):
            for x in range(0, width // 8):
                byte = 0
                for i in range(8):
                    pixel = image.getpixel((x * 8 + i, y))
                    byte |= (pixel & 1) << (7 - i)
                zpl_command += "{:02X}".format(byte)

        # Close the ZPL command string
        zpl_command += "^FS"
    
        # Print or save the ZPL command string as needed
        print(zpl_command)

    #end

    code.append(zpl_command)
    code.append(end)
    #total = start + change_font + code +end

    delimiter = ','  # Delimiter to be used between elements

    result_string = delimiter.join(code)
    print(result_string)  
    
    ts = datetime.now().strftime("%Y%m%d%H%M%S")
    fname = f"{MEDIA_FOLDER}/Label_{ts}.zpl"
    
    f = open(fname, "w")
    f.write(result_string)
    f.close()
        
    return{"success": True, "file_path": fname,"label_data":result_string}

if __name__ == "__main__":
    app.run(debug=False, host="0.0.0.0")