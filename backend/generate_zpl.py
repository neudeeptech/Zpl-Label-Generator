import numpy as np
def generate():    
    print("hello world!")
    start = "^XA"
    end = "^XZ"
    label_pos = "^FT"
    label_text_tag = "^FD" 

    change_font = "^CF0,30"
    start_of_field ="^FO"
    end_of_field = "^FS"
    input_text = ['product_code','product_name','customer_code','customer_name']
    input_label = ['product_code','product_name','customer_code','customer_name']

    input_field = "product_name"

    x_start_label = 120 
    y_start_label = 90

    x_start_value = 370
    y_start_value = 90

    
    y_diff_label = 30
    y_diff_value = 30

    code = []
    code.append(start)
    code.append(change_font)
    
    for num in range(1, len(input_text)):
        print("_____________________________",input_text[num])
        print("******************************",input_label[num])
        
        y_start_label = y_start_label+y_diff_label
        y_start_value = y_start_value + y_diff_value

        code.append(start_of_field +str(x_start_label)+","+str(y_start_label)+label_text_tag+input_text[num]+end_of_field +start_of_field +str(x_start_value)+","+str(y_start_value)+label_text_tag+input_label[num]+end_of_field)  
    code.append(end)
    #total = start + change_font + code +end

    total = np.array(code)
    #print(start+label_pos+label_text+input_field+end)
    print(total)

generate()