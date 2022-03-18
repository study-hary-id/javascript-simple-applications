// Print text on canvas element using fillText.
var canvas = document.createElement("canvas");
var context = canvas.getContext("2d");
document.body.appendChild(canvas);

context.font = "20px arial";
context.fillText("xyz", 50, 50);

// Print text directly to html document using write method.
document.body.style.fontFamily = "arial";
document.body.style.fontSize = "20px";
document.write("xyz");
