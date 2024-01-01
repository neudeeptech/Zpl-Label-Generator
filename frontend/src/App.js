import React, { useEffect, useLayoutEffect, useRef, useState, useHistory } from "react";
import axios from 'axios';
import "./style.css";
import { Link } from "react-router-dom";
import { fabric } from 'fabric';
import JsBarcode from 'jsbarcode';
import QRCode from 'qrcode';

import BoldImage from './images/bold.png';
import database_daily_export from './images/database_daily_export.png';
import external_printer_school from './images/external_printer_school.png';
import external_save_file_web_flaticons_flat_flat_icons from './images/external_save_file_web_flaticons_flat_flat_icons.png';
import LineImage from './images/line.png';
import PictureImage from './images/picture.png';
import rectangle_stroked from './images/rectangle_stroked.png';
import text_box from './images/text_box.png';
import weight_kg from './images/weight_kg.png';
import databse_export from './images/database_export.png';
import horizontal_line from './images/horizontal-line.png';
import vertical_line from './images/icons8-vertical-line-48.png';

const App = ({ selectedObject }) => {
  const [canvasObjects, setCanvasObjects] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false); //file dropdown
  const [entities, setEntities] = useState([]);
  const [selectedEntityName, setSelectedEntityName] = useState(""); //select the name from DB list
  const [isListOpen, setIsListOpen] = useState(true);  //list open/close
  const [selectedEntityPosition, setSelectedEntityPosition] = useState({ x: 0, y: 0 });   //setting coordinates to move the DB entities on canvas
  // const [barcodeFlag, setbarcodeFlag] = useState(false);
  // const [qrFlag, setqrFlag] = useState(false);
  const defaultCanvasWidth = 300; // Default canvas width in pixel
  const defaultCanvasHeight = 300; // Default canvas height in pixel
  const [canvasWidth, setCanvasWidth] = useState(defaultCanvasWidth);
  const [canvasHeight, setCanvasHeight] = useState(defaultCanvasHeight);
  const [selectedSize, setSelectedSize] = useState(`${defaultCanvasWidth}x${defaultCanvasHeight}`);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
   const labelUnitSelect = document.getElementById("label-unit");
  const canvasRef = useRef(null);
  const [image, setImage] = useState('');
  const [image_name, setImageName] = useState('');
  const [logo_flag,setLogoFlag] = useState(false);
  const [file_path,setFilePath] = useState('');
  const [selectedUnit, setSelectedUnit] = useState(''); // Default unit is pixels
  const [qrCodeGenerate, setQRCodeGenerate] = useState(" ");
  const [barCodeGenerate, setBarCodeGenerate] = useState(""); //initial value of barcode

  const line_co_ords=[];
  const rectangle_co_ords = [];
  
  const text_values = [];
  const text_values_co_ords = [];
  const img_details = [];
  const barcode_cords = [];
  const qr_code_cords = [];
  const font_size = [];
  const fontweight_array=[];

useEffect(() => {
  const canvas = new fabric.Canvas(canvasRef.current, {
    
    width: canvasWidth,
    height: canvasHeight,
  });
  //console.log("Inside useEffect(width,height)",labelWidth,labelHeight);

  // Make the canvas accessible in the drawLine and drawRectangle functions
  window.canvas = canvas;

  canvas.on('object:added', () => {
    const objects = canvas.getObjects();
    setCanvasObjects(objects);
  });

  canvas.on('selection:created', (event) => {
    const selectedObject = event.target;
    if (selectedObject && selectedObject.type === 'textbox') {
      console.log('Font Size:', selectedObject.fontSize);
      console.log('Font Weight:', selectedObject.fontWeight);
    }
  });
  return () => {
    // Clean up the canvas when the component is unmounted
    canvas.dispose();
  };
}, []); // Empty dependency array to run this effect only once


const  jsonData = () =>{
  const barcodeInputs = document.getElementById("barcodeEntity").value;
  const qrCodeInputs = document.getElementById("qrCodeEntity").value;
  const fontSizeInput = document.getElementById('fontSizeInput').value;
  const fontStyleSelect = document.getElementById('fontStyleSelect');
  const selectedFontStyle = fontStyleSelect.value;

  let data = {
    'input_labels': text_values,
    'line_co_ordinates':line_co_ords,
    'rect_co_ordinates':rectangle_co_ords,
    'text_values_co_ords':text_values_co_ords,
    'input_qr_code':qrCodeInputs,
    'input_barcode':barcodeInputs,
    'barcode_cords':barcode_cords,
    'qr_code_cords': qr_code_cords,
    'fontSizeInput': fontSizeInput,
    'font_size': font_size,
    'selectedFontStyle':selectedFontStyle,
    'logo_flag':logo_flag,
    'fontweight_array':fontweight_array,
    'image_data':img_details,
    'file_path':file_path
  }
  return JSON.stringify(data)
}

const handleSave = () => {
  const { canvas } = window;
  console.log("save")
  
  const coordinates = canvasObjects.map((object) => {
    return{ 
      text: object.text,
      type: object.type, // Type of object (e.g., 'rect', 'text')
      prop: object.prop,
      y1:object.top,
      x1:object.left,
      x2: object.left + object.width,
      y2: object.top + object.height,
      text_size: object.fontSize,
      width: object.width,
      height: object.height,
      scaleX:object.scaleX,
      scaleY:object.scaleY,
      angle:object.angle,
      fontWeight:object.fontWeight,
    }
  });
  
  console.log("** coordinates **",coordinates)
  
  line_co_ords.length = 0
  rectangle_co_ords.length = 0
  text_values.length = 0
  text_values_co_ords.length = 0
  img_details.length = 0
  barcode_cords.length = 0
  qr_code_cords.length = 0
  font_size.length = 0
  fontweight_array.length=0
  for (var i = 0; i < coordinates.length; i++) {
    var dictionary = coordinates[i];
    if(dictionary.type == "image")
    {
      img_details.push({'x1':dictionary.x1,'y1':dictionary.y1})
      console.log("img details",img_details)
    }

    if(dictionary.type === "text")
    {
      console.log("************************************* dict text 1",dictionary.text)
      if(dictionary.text !=''){
        console.log("&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&& dict text 2 ",dictionary.text)
        text_values.push(dictionary.text)
        text_values_co_ords.push({'x1':dictionary.x1,'y1':dictionary.y1})
        font_size.push(dictionary.text_size)
        fontweight_array.push(dictionary.fontWeight)
      }
    }
    else if(dictionary.type === "rect"){
      rectangle_co_ords.push({'x2':dictionary.scaleX*dictionary.width,'y2':dictionary.scaleY*dictionary.height,'x1':dictionary.x1,'y1':dictionary.y1})
    }
    else if(dictionary.type === "line"){
      line_co_ords.push({'x1':dictionary.x1,'y1':dictionary.y1,'x2':dictionary.width*dictionary.scaleX,'y2':dictionary.height*dictionary.scaleY,'angle':dictionary.angle})
    }
    else if(dictionary.prop === "qr_code")
    {
      qr_code_cords.push({'x1':dictionary.x1,'y1':dictionary.y1,'width':dictionary.width})
    }
    else if(dictionary.prop === "barcode")
    {
      barcode_cords.push({'x1':dictionary.x1,'y1':dictionary.y1,'width':dictionary.height})
    }
  
  }
  
  try{
  
    const post_data = jsonData()//give function call to json data 
    //to send post req to generate code
  
    console.log("Posttttttt Dataaaaa, resssssssssssponseeee",post_data)
     axios.post('http://127.0.0.1:5000/generate_zpl',post_data,{
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(response => {
    // Access the 'data' property
    console.log(" resssssssssssponseeee",response['data'])
                let file_path = response['data']['file_path']
                window.open(`http://127.0.0.1:5000/` + file_path); 
   })
  }
    catch(error){
  }
  
  console.log("&&&&&&&&&&&&&&&&&&& line ",line_co_ords)
  console.log("&&&&&&&&&&&&&&&&&&& rect ",rectangle_co_ords)
  console.log("&&&&&&&&&&&&&&&&&&& text_values ",text_values)
  console.log("&&&&&&&&&&&&&&&&&&& co ords ",text_values_co_ords)
  console.log("&&&&&&&&&&&&&&&&&&& img details ",img_details)

  }
  
  

  
const drawLine = () => {
    console.log("*****inside drawLine******");
    // const canvas = new fabric.Canvas(canvasRef.current);
    const { canvas } = window;
      let line = new fabric.Line([50,50,130,50], {
      stroke: 'black',
      strokeWidth: 1,
      // angle:-45,
      selectable:true,
      prop:"line"

    });
    line.setControlsVisibility({
      mt: true, // top middle point for resizing
      mb: true, // bottom middle point for resizing
      ml: true, // left middle point for resizing
      mr: true, // right middle point for resizing
      tr: true, // top right point for resizing -false
      tl: true, // top left point for resizing
      br: true, // bottom right point for resizing
      bl: false, // bottom left point for resizing
    });
    canvas.add(line);
    canvas.requestRenderAll();
};

const drawVerticalLine = () => {
  console.log("*****inside drawVerticalLine******");
  const { canvas } = window;

  let verticalLine = new fabric.Line([100, 50, 100, 150], {
      stroke: 'black',
      strokeWidth: 1,
      selectable: true,
      prop: "verticalLine"
  });

  verticalLine.setControlsVisibility({
      mt: true,
      mb: true,
      ml: true,
      mr: true,
      tr: false,
      tl: false,
      br: false,
      bl: true,
  });

  canvas.add(verticalLine);
  canvas.requestRenderAll();
};


const drawRectangle = () => {
  // const canvas = new fabric.Canvas(canvasRef.current);
  console.log("*****inside drawRectangle******");
  const { canvas } = window;
      const rect = new fabric.Rect({
        left: 100,
        top: 100,
        width: 100,
        height: 50,
        fill: 'rgba(0,0,0,0)',
        strokeWidth: 1,
        stroke: 'black',
        selectable: true,
        prop:"rect"
      });

      canvas.add(rect);
};

const addText = ()=>{
  console.log("*****inside ADDTEXT******");
    const { canvas } = window;
    const text = new fabric.Textbox('text', {
    left: 50,
    top: 50,
    type:"text",
    prop:"text",
    width: 90, // Set the width of the text box
    fontSize: 24, // Set the font size
    fontFamily: 'Arial',
    fill: 'black', // Set the text color
    
  });
  text.setControlsVisibility({
    mt: false, // top middle point for resizing
    mb: false, // bottom middle point for resizing
    ml: true, // left middle point for resizing
    mr: true, // right middle point for resizing
    tr: false, // top right point for resizing
    tl: false, // top left point for resizing
    br: false, // bottom right point for resizing
    bl: false, // bottom left point for resizing
  });
  // Add the text box to the canvas
  canvas.add(text);

}

function updateTextProperties() {
  const { canvas } = window;
  console.log("updateTextProperties ");
  const fontSizeInput = document.getElementById('fontSizeInput').value;
  const fontStyleSelect = document.getElementById('fontStyleSelect');
  const selectedFontStyle = fontStyleSelect.value;
  const activeObject = canvas.getActiveObject();
  console.log("activeObject ");
  if (activeObject && activeObject.type === 'text') {
    if (fontSizeInput) {
      activeObject.set('fontSize', parseInt(fontSizeInput, 10));
      console.log("updated font size",fontSizeInput);
    }
    if (selectedFontStyle) {
      activeObject.set('fontFamily', selectedFontStyle);
      console.log('Updated font style:', selectedFontStyle);
    }

    canvas.renderAll();
  }
}

  const toggleFontWeight=() => {
    const canvas = window.canvas;
    const activeObject = canvas.getActiveObject();

    if (activeObject && activeObject.type === 'text') {
      const fontWeight = activeObject.fontWeight === 'bold' ? 'normal' : 'bold';
      activeObject.set('fontWeight', fontWeight);
      canvas.renderAll();
      updateFontWeightButtonState(fontWeight === 'bold');
    }
  }

  const updateFontWeightButtonState=(isBold)=>{
    const fontWeightButton = document.getElementById('fontWeightButton');
    fontWeightButton.style.fontWeight = isBold ? 'bold' : 'normal';
  }

  useEffect(() => {
    const fontWeightButton = document.getElementById('fontWeightButton');
    fontWeightButton.addEventListener('click', toggleFontWeight);
  
    return () => {
      fontWeightButton.removeEventListener('click', toggleFontWeight);
    };
  }, []);

useEffect(() => {
   uploadImage();
 },[image]);

const uploadImage=() => {
  const { canvas } = window;
  
  if (image) {
    const img = new Image();
    onFileUpload()
    img.src = URL.createObjectURL(image);
    // const img1 = convertToGrayscale(img);
    //console.log("*********************************************************** img ",img)
    //console.log("*********************************************************** img name ",img.src)
    
    fabric.Image.fromURL(img.src, (img) => {
      // Set image dimensions and position as needed
      console.log(img)
      img.scaleX = 0.2; // Horizontal scale factor
      img.scaleY = 0.2; // Vertical scale factor
    
      img.set({left: 50,
        top: 40,
        type:"image",
        prop:"image",
        file:image,
        filename:image_name
       });
       
       // Create a grayscale filter using fabric js filters
      const grayscaleFilter = new fabric.Image.filters.Grayscale();

      // Add the grayscale filter to the image's filters array
      img.filters.push(grayscaleFilter);

      // Apply the filters
      img.applyFilters();
           
      canvas.add(img);
  
      // Optionally, you can render the canvas to apply changes
      canvas.renderAll();
    });
}
}
const handleImageUpload = (event) => {
  const uploadedImage = event.target.files[0];
  setImage(uploadedImage);
  setImageName(uploadedImage.name)
  console.log("********************* name *******************",uploadedImage.name)
  setIsDialogOpen(false);
 
};


const onFileUpload = async() => {
  // Create an object of formData
  const data = new FormData();

  if(image==null)
  {
      alert("please select file!")
      return
  }
 
  // Update the formData object
  data.append('file',image);
  data.append('fileName',image_name);
  //console.log("******************* image name ",image_name)
  //console.log("******************** image ",image)
  const config = {
    headers: {
      'content-type': 'multipart/form-data',
    },
  };

  //console.log("formData",data.entries);
  //console.log( post(urls.IMPORT_DATA,data,config))
  let response = await axios.post('http://127.0.0.1:5000/upload_image', data).then(res => {
      //console.log("import response",res['data']['message'])
      //alert(res['data']['message'])
      setLogoFlag(true)
      setFilePath(res['data']['filepath'])
    })
    .then(res => { // then print response status
      //console.log(res)
   })
   //console.log("import ",response)
   //this.setState({ selectedFile:null });
 }

const handleImageClick = () => {
  setIsDialogOpen(true);
};

const handleOkButtonClick = () => {
  // Close the dialog
 
  setIsDialogOpen(false);
};


const handleDeleteKey = (event) => {
  const { canvas } = window;
  if (event.key === "Delete") {
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
      if (activeObject.prop === 'barcode') {
        // Clear the barcode input value and reset barCodeGenerate
        setBarCodeGenerate('');
        document.getElementById('barcodeEntity').value = '';
      }
      if (activeObject.prop === 'qr_code') {
        // Clear the barcode input value and reset barCodeGenerate
        setQRCodeGenerate('');
        document.getElementById('qrCodeEntity').value = '';
      }
      canvas.remove(activeObject);
      canvas.requestRenderAll();
    }
  }
};
useEffect(() => {
  document.addEventListener("keydown", handleDeleteKey);

  return () => {
    document.removeEventListener("keydown", handleDeleteKey);
  };
}, []);



const addEntity = () => {
  const { canvas } = window;
  let adjustedX = 240 ;
  let adjustedY = 50 ;
  const entity = new fabric.Textbox(selectedEntityName,{
    adjustedX,
    adjustedY,
    left: 50,
    top: 50,
    type:"text",
    width: 90, // Set the width of the text box
    fontSize: 24, // Set the font size
    fill: 'black', // Set the text color
    prop:"label"
  });
  
  if(!selectedEntityName==''){
    entity.setControlsVisibility({
      mt: false, // top middle point for resizing
      mb: false, // bottom middle point for resizing
      ml: true, // left middle point for resizing
      mr: true, // right middle point for resizing
      tr: false, // top right point for resizing
      tl: false, // top left point for resizing
      br: false, // bottom right point for resizing
      bl: false, // bottom left point for resizing
    });
    canvas.add(entity);
  }
    
};

// Call drawCanvas whenever the selected entity name changes
useEffect(() => {
  
  addEntity();
  
}, [selectedEntityName]);

const handleDBImageClick = () => {
 // console.log('handleDBImageClick triggered ************');
 // console.log('Before state update - isListOpen:', isListOpen);

if (isListOpen) {
  setIsListOpen(false);
  axios.get('http://127.0.0.1:5000/select_labels')
  .then(response => {
  const responseData = response.data.data; // Access the 'data' property
  
  // Assuming the response is an array of entities
  if (Array.isArray(responseData)) {
    setEntities(responseData);
  //  console.log("Entities updated:", responseData);
    
  } else {
    console.error('Invalid response format:', responseData);
    
  }
})
.catch(error => {
  console.error('Error fetching entities:', error);
});
}
else{
  setIsListOpen(true);
  setEntities([]);
}
//console.log('isListOpen:', isListOpen);
//console.log('After state update - isListOpen:', isListOpen);
};

const handleEntityClick = (entityName) => {
  setSelectedEntityName(entityName);
  setIsListOpen(false);
  //console.log("********selected Entity name*******",entityName);
  //val_array.push(entityName)
  let currentY = 70;
  const entityPosition = { x: 50, y: currentY}; // Replace with actual coordinates
  setSelectedEntityPosition(entityPosition);
  //currentY += 20;
};

const handleWeightDBImageClick = () => {
if (isListOpen) {
  setIsListOpen(false);
  const responseData = [{name:'pcs'},{name:'kg'},{name:'g'},{name:'mg'}]
  setEntities(responseData);
}
else{
  setIsListOpen(true);
  setEntities([]);
}

};

const handlewtEntityClick = (entityWt) => {
  setSelectedEntityName(entityWt);
  setIsListOpen(false);
  //console.log("selecteddddddddddddd nameeeeeeee",entityWt);
  //val_array.push(entityWt)
//   const entityPosition = { x: 120, y: 100 }; // Replace with actual coordinates
// setSelectedEntityPosition(entityPosition);
};


const handleTimeDBImageClick = () => {
  if (isListOpen) {
    setIsListOpen(false);
    const responseData = [{name:'Date'},{name:'Time'},{name:'DateTime'}]
    setEntities(responseData);
    console.log("Entities updated:", responseData);
  }
  else{
    setIsListOpen(true);
    setEntities([]);
  }
};

const handleTDEntityClick = (entityTd) => {
  setSelectedEntityName(entityTd);
  setIsListOpen(false);
  console.log("selecteddddddddddddd nameeeeeeee",entityTd);
 // val_array.push(entityTd)

};

function toggleDropdown() {
  setShowDropdown((prevShowDropdown) => !prevShowDropdown);
  
}
function handleClickOutside(event) {
  if (!event.target.matches('.dropbtn')) {
    setShowDropdown(false);
  }
 
}

// Attach the event listener for clicks outside the dropdown of FILE
React.useEffect(() => {
  document.addEventListener('click', handleClickOutside);
  return () => {
    document.removeEventListener('click', handleClickOutside);
  };
}, []);


const handleSaveFile = () => {
  console.log("*******inside save function******");
  const { canvas } = window;
  const canvasJson = JSON.stringify(canvas.toJSON());
  const blob = new Blob([canvasJson], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'canvas_content.json';
  a.click();
  URL.revokeObjectURL(url);
}


function handleFileUpload(event) {
  const { canvas } = window;
  const file = event.target.files[0];
  const reader = new FileReader();

  reader.onload = function (e) {
    const loadedJson = JSON.parse(e.target.result);
    canvas.loadFromJSON(loadedJson, function () {
      canvas.renderAll();
    });
  };

  reader.readAsText(file);
}

function clearCanvas() {
  const { canvas } = window;
  canvas.clear();
  // Clear input values for barcodeEntity and qrCodeEntity
  setBarCodeGenerate('');
  setQRCodeGenerate('');
  // Clear input values for label_width and label_height
  // document.getElementById('label_width').value = '';
  // document.getElementById('label_height').value = '';
  // // Set "Select unit" as the selected option
  // const labelUnitSelect = document.getElementById('label-unit');
  // labelUnitSelect.selectedIndex = 0;
}

//Handle Canvas size 
const labelSize = () => {
  const selectedValue = document.getElementById("label-unit").value;
  const selectedWidth = document.getElementById("label_width").value;
  const selectedHeight = document.getElementById("label_height").value;

  const canvas = window.canvas; // Get the global canvas reference

  if (selectedValue === "mm") {
    const widthInPixels = selectedWidth / 0.264;
    const heightInPixels = selectedHeight / 0.264;
    if(selectedWidth > 210 || selectedHeight >110){
      alert("width and height must be less than 210 mm and 110 mm respectively");
      return
    }
    canvas.setWidth(widthInPixels);
    canvas.setHeight(heightInPixels);
  } else if (selectedValue === "inch") {
    const widthInPixels = selectedWidth / 0.010416667;
    const heightInPixels = selectedHeight / 0.010416667;
    if(selectedWidth > 8 || selectedHeight >4){
      alert("width and height must be less than 8 inch and 4 inch respectively");
      return
    }
    canvas.setWidth(widthInPixels);
    canvas.setHeight(heightInPixels);
  } else if (selectedValue === "cm") {
    const widthInPixels = selectedWidth / 0.026458333;
    const heightInPixels = selectedHeight / 0.026458333;
    if(selectedWidth > 21 || selectedHeight >11){
      alert("width and height must be less than 21 cm and 11 cm respectively");
      return
    }
    canvas.setWidth(widthInPixels);
    canvas.setHeight(heightInPixels);
  } else if (selectedValue === "Select unit") {
    // Handle the default case if needed
  }
};


const handleHeightChange = (e) => {
  const selectedValue = document.getElementById("label-unit").value;
  const newHeight = parseInt(e.target.value, 10);
  const { canvas } = window;
  if (selectedValue === "mm") {
    const heightInPixels = newHeight / 0.264;
    if(newHeight > 110 ){
      alert(" height must be less than 110 mm ");
      return
    }
    canvas.setHeight(heightInPixels);
    console.log("heightInPixels to  mm",heightInPixels);
  } else if (selectedValue === "inch") {
    const heightInPixels = newHeight / 0.010416667;
    if(newHeight > 4 ){
      alert(" height must be less than 4 inch ");
      return
    }
    canvas.setHeight(heightInPixels);
  } else if (selectedValue === "cm") {
    const heightInPixels = newHeight / 0.026458333;
    if(newHeight > 11 ){
      alert(" height must be less than 11 cm ");
      return
    }
    canvas.setHeight(heightInPixels);
  } else if (selectedValue === "Select unit") {
    // Handle the default case if needed
  }
};

const handleWidthChange = (e) => {
  const selectedValue = document.getElementById("label-unit").value;
  const newWidth = parseInt(e.target.value, 10);
  const { canvas } = window;
  if (selectedValue === "mm") {
    const widthInPixels = newWidth / 0.264;
    if(newWidth > 210 ){
      alert("width and height must be less than 210 mm ");
      return
    }
    console.log("***newWidth*",newWidth);
    console.log("***widthInPixels*",widthInPixels);
    canvas.setWidth(widthInPixels);
    
  } else if (selectedValue === "inch") {
    const widthInPixels = newWidth / 0.010416667;
    if(newWidth > 8 ){
      alert("width and height must be less than 8 inch ");
      return
    }
    canvas.setWidth(widthInPixels);
  } else if (selectedValue === "cm") {
    const widthInPixels = newWidth / 0.026458333;
    if(newWidth > 21 ){
      alert("width and height must be less than 21 cm ");
      return
    }
    canvas.setWidth(widthInPixels);
  } else if (selectedValue === "Select unit") {
    // Handle the default case if needed
  }
};

 const handleUnitChange = (e) => {
  const newUnit = e.target.value;
  setSelectedUnit(newUnit);
  labelSize(newUnit); // Call labelSize with the new unit
};

    const handleQRInputChange = (event) => {
      setQRCodeGenerate(event.target.value);
      createQRCode();
    };

    const handleBarcodeInputChange = (event) => {
      setBarCodeGenerate((prevValue) => event.target.value);
      createBarcode();
    };

    const createBarcode = () => {
      const { canvas } = window;
      canvas.getObjects('image').forEach((obj) => {
        // canvas.remove(obj);
        if (obj.prop === 'barcode') {
          canvas.remove(obj);
        }
      });

      // Generate the barcode using JsBarcode
      const barcodeCanvas = document.createElement('canvas');
      // JsBarcode(barcodeCanvas, barCodeGenerate);
      JsBarcode(barcodeCanvas, barCodeGenerate, {
        format: 'CODE128', // Barcode format
        width: 1,           // Width of each bar
        height: 50,         // Height of the barcode
        displayValue: false  // Whether to display the value as text or not
      });

      const barcodeImage = new fabric.Image(barcodeCanvas, {
        left: 50,
        top: 50,
        prop:"barcode"
      });

      canvas.add(barcodeImage);
      canvas.renderAll();
    };

    
    const createQRCode = () => {
      const { canvas } = window;
      canvas.getObjects('image').forEach((obj) => {
        // canvas.remove(obj);
        if (obj.prop === 'qr_code') {
          canvas.remove(obj);
        }
      });

      QRCode.toDataURL(qrCodeGenerate, {
        width: 80,     // Set the width of the QR code
        margin: 2       // Set the margin (quiet zone) around the QR code
      })
        .then((url) => {
          const qrCodeImage = new fabric.Image.fromURL(url, (img) => {
            img.set({
              left: 50,
              top: 150,
              width:80,
              prop:"qr_code"
            });
            canvas.add(img);
            canvas.renderAll();
          });
        })
        .catch((error) => {
          console.error('Error generating QR code:', error);
        });
    };

    return (
    <body style={{background: "#98d4db"}}>
    <div className="container" style={{background: "#98d4db"}} >
      
      <section className="tools-board" >
        <div style={{height:"1.3cm"}}>
         
            <div className="dropdown">
              <button 
              onClick={toggleDropdown} 
              className="dropbtn">File</button>&emsp;
              <div id="myDropdown" className={`dropdown-content ${showDropdown ? 'show' : ''}`}>
                {/* prevent default action of anchor tag, i.e preventing it from redirecting to home url */}
                <a href="/#" onClick={(e) => { e.preventDefault(); clearCanvas(); }}>New</a> 
                <span>
                  <label htmlFor="fileInput" style={{ cursor: "pointer", padding: "8px 12px" }}>
                    Open
                  </label>
                  <input
                    type="file"
                    id="fileInput"
                    onChange={handleFileUpload}
                    style={{ display: "none" }}
                  />
                  </span>
                
                <a href="#home" onClick={handleSaveFile}>Save</a> 
                
              </div>
            </div>

          <label className="title">View</label>&emsp;

          {/* <label class="title">Save File</label> */}
          <img width="24" height="24" padding="1" src={external_save_file_web_flaticons_flat_flat_icons} alt="external-save-file-web-flaticons-flat-flat-icons" 
            onClick={handleSave}
            title="Click to Save as Image"/>&emsp;
        </div>
        
        {/* <div className="row shape" style={{ position: "fixed", paddingTop: "1.2cm" }}> */}
        <div style={{height:"1.5cm"}}>
        <img width="24" height="27" src={external_printer_school}/>&emsp;&nbsp;
        
          <img
            width="28"
            height="27"
            src={databse_export}
            alt="database-daily-export"
            id="handleDBImage"
            onClick={handleDBImageClick}
            style={{ cursor: 'pointer' }}
          />&emsp;&nbsp;
          
          <div className={`entity-list ${isListOpen ? 'open' :''}`} >
              
              {entities.length> 0 && (
                <ul>
                  {entities.map(entity => (
                          <li key={entity.id} onClick={() => handleEntityClick(entity.name)} className={selectedEntityName === entity.name ? 'selected' : ''}>
                            {entity.name}
                          </li>
                        ))}
                 </ul>
                  )
                  }
              
            </div>
         
            
        <img width="28" height="29" src={weight_kg} alt="weight-kg" onClick={handleWeightDBImageClick}
            style={{ cursor: 'pointer' }}/>&emsp;&nbsp;
            <div className={`wt-entity-list ${isListOpen ? 'open' : ''}`} >
              
              {entities.length> 0 && (
                <ul>
                 {entities.map(entity => (
                          <li key={entity.id} 
                          onClick={() => 
                          handlewtEntityClick(entity.wt)
                        } 
                          className={selectedEntityName === entity.wt ? 'selected' : ''}>
                            {entity.wt}
                          </li>
                        ))}
                </ul>
              )}
            </div>
            
        <img width="28" height="28" src={database_daily_export} alt="database-export"
        onClick={handleTimeDBImageClick}
            style={{ cursor: 'pointer' }}/>&emsp;&nbsp;

            <div className={`tm-entity-list ${isListOpen ? 'open' : ''}`} >
              
              {entities.length> 0 && (
                <ul>
                  
                  {entities.map(entity => (
                          <li key={entity.id} onClick={() => handleTDEntityClick(entity.date)} className={selectedEntityName === entity.date ? 'selected' : ''}>
                            {entity.date}
                          </li>
                        ))}
                 
                </ul>
              )
              }
            </div>
         
      <button id="drawLine">
        <img
        width="24"
        height="24"
        src={horizontal_line}
        alt="line"
        onClick={drawLine} // Optional: handle image click event
      />
      </button>
      &emsp;&nbsp;

      <button id="drawLine">
        <img
        width="24"
        height="24"
        src={vertical_line}
        alt="line"
        onClick={drawVerticalLine} // Optional: handle image click event
      />
      </button>
      &emsp;&nbsp;

        <button id="drawRect">
        <img 
        width="26" 
        height="23"
        src={rectangle_stroked}
        alt="rectangle-stroked"
        onClick={drawRectangle}
        />
        </button>&emsp;&nbsp;
        
        <button id="drawRect">
        <img 
        width="26" 
        height="23"
        src={text_box} 
        alt="rectangle-stroked"
        onClick={addText}
        />
        </button>&emsp;&nbsp;

        <button id="fontWeightButton">
        <img width="25" height="23" src={BoldImage} alt="bold"/>
        </button>&emsp;
              
        <button>
        <img width="26" height="23" src={PictureImage} alt="pic" onClick={handleImageClick}/></button>
        {isDialogOpen && (
        <div className="dialog">
        <input
         type="file"
         accept="image/*"
         onChange={handleImageUpload}
        />
      <button onClick={handleOkButtonClick} size="small">OK</button> 
        </div>
      )}
      {/*<hr style={{color:"#fff9f7", width:"100%"}}></hr>*/}
      </div>
      <div>
        <label htmlFor="label-size">Label Template Size : </label>
        
         <input type="number" id="label_width" name="label_width" placeholder="w"min="1" 
        onChange={handleWidthChange} />x 
         <input type="number" id="label_height" name="label_height" placeholder="h"min="1"
        onChange={handleHeightChange} />&nbsp;
     
       <select id="label-unit" name="label-unit" 
        onChange={handleUnitChange}>  
        <option >Select unit</option> 
        <option value="mm">mm</option> 
	      <option value="inch">inch</option>
        <option value="cm">cm</option>
        </select> &emsp;

        {/* <Link to = '/admin-home'> */}
        {/* <button
        variant="contained"
        size="small"
        style={{backgroundColor:"#4169E1", color:"#FFFFFF"}}
        >Back to Home
        </button> */}
        {/*</Link> */}
       
      </div>
      </section>

       <section className="drawing-board">
        <div>
          <span>
          <label><b>Behaviour</b></label><br/>
          <label>Barcode : </label>
          <input
            type="text"
            id="barcodeEntity"
            name="barcodeEntity"
            value={barCodeGenerate}
            onChange={(event) => {
              handleBarcodeInputChange(event);
            }}
          /><br/>
        
        {/* <img width="20" height="20" src="https://img.icons8.com/3d-fluency/94/add.png" alt="add"  onClick={createBarcode}/>  */}
        <label>QRcode :  </label>
            <input
              type="text"
              id="qrCodeEntity"
              name="qrCodeEntity"
              value={qrCodeGenerate}
              onChange={(event) => {
                handleQRInputChange(event);
                
              }}
            />
           </span><br/>      
          <span>
          <label><b>Text Properties</b></label><br/><br />
      <label htmlFor="fontStyleSelect">Font Style : </label>
      <select id="fontStyleSelect" onChange={updateTextProperties}>
        <option value="Arial">Arial</option>
        <option value="Times New Roman">Times New Roman</option>
        {/* <option value="Courier New">Courier New</option> */}
        {/* Add more font styles as needed */}
      </select>
      <br />
      <label htmlFor="fontSizeInput" >Font Size : </label> &nbsp;
      <input type="number" id="fontSizeInput" onChange={updateTextProperties}/>
      <br />
      </span> 
	    </div> 
      <div>
        
        <canvas
        id="canvas"
         ref={canvasRef} 
          />
        </div>
        
        </section>
    </div>
  </body>
  );
};



export default App;
