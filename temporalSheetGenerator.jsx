// temporal sheet generator
//generateTemporalSheet("C:/Users/Natel/Videos/demo vids/seq");
sheetToVideo("C:/Users/Natel/Videos/demo vids/sd sheet");

function generateTemporalSheet(outputPath) {
    if(app.project.activeItem == null || !(app.project.activeItem instanceof CompItem)) {
        alert("Please select a composition");
        return false;
        }
    
    var comp = app.project.activeItem;
    var sheetComps = [];
    
    //app.beginUndoGroup("Generate Temporal Sheet");
    
    var numFrames = comp.duration*Math.floor(1/comp.frameDuration);
    var totalFrameCounter = 1;
    var numSheets = Math.ceil(numFrames/16);
    var ogWidth = comp.width;
    var ogHeight = comp.height;
    
    for(var s = 0; s < numSheets; s++) {
        var sheetComp = app.project.items.addComp(comp.name+"_Sheet "+s.toString(), ogWidth*4, ogHeight*4, 1, .03, 30);
        sheetComps.push(sheetComp);
            for(var y = 0; y < 4; y++) {
                for(var x = 0; x < 4; x++) {
                var exemplaire = sheetComp.layers.add(comp);
                exemplaire.property("ADBE Transform Group").property("ADBE Position").setValue([x*ogWidth+(ogWidth/2),y*ogHeight+(ogHeight/2)]);
                exemplaire.startTime -= totalFrameCounter/30;
                totalFrameCounter++;    
                }
            }
        
        sheetComp.openInViewer();
        }
    
    // render
    var staticName = sheetComps[0].name;
    for(var s = 0; s < sheetComps.length; s++) {
         rqItem = app.project.renderQueue.items.add(sheetComps[s]);
         module = rqItem.outputModules[1];
         module.file = File(outputPath+"/"+sheetComps[s].name+".avi");
         module.applyTemplate("JPG");
        }
    
    app.project.renderQueue.render();
    // rename rendered images
    var files = Folder(outputPath).getFiles();
    for(var f = 0; f < files.length; f++) {
        files[f].rename(files[f].name.replace(/_00000/g, ""));
        }    
    
    //app.endUndoGroup();
    }

function sheetToVideo(sheetsFolder) {
    app.beginUndoGroup("sheetToVideo");
    var items = [];
    var frameCounter = 0;
    var files = Folder(sheetsFolder).getFiles();
    for(var f = 0; f < files.length; f++) {
        items.push(app.project.importFile(new ImportOptions(files[f])));
        }
    
    var startX = items[0].width/4*2; 
    var startY = items[0].height/4*2;
    
    $.writeln(startX);
    $.writeln(startY);
    
    var videoComp = app.project.items.addComp(items[0].name, items[0].width/4, items[0].height/4, 1, (items.length*16)/30, 30);
    
    for(var i = 0; i < items.length; i++) {
            for(var y = 0; y < 4; y++) {
                for(var x = 0; x < 4; x++) {
                    var layer = videoComp.layers.add(items[i]);
                    $.writeln("x = " + x + ", y = " + y);
                    $.writeln([startX-(x*items[0].width), startY-(y*items[0].height)]);
                    layer.property("ADBE Transform Group").property("ADBE Position").setValue([startX-(x*items[0].width/4), startY-(y*items[0].height/4)]);
                    
                    layer.outPoint = videoComp.frameDuration;
                    layer.startTime+=frameCounter/30;
                    frameCounter++;
                }
            }
        }
    
    videoComp.openInViewer();
    
    app.endUndoGroup();
    }