// Print text on canvas element using fillText.
var canvasText = document.getElementById("canvas-text");
var canvas = document.createElement("canvas");
var context = canvas.getContext("2d");

canvas.setAttribute("id", "second-canvas");
canvasText.appendChild(canvas);

context.font = "20px arial";
context.fillText("xyz", 50, 50);

// Print text directly to html document using write method.
var htmlText = document.getElementById("html-text");
document.body.style.fontFamily = "arial";
document.body.style.fontSize = "20px";
document.write("xyz");
