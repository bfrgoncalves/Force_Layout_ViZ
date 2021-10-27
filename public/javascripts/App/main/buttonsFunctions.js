function loadButtonFunctions(){

	return {

		datasetInfo: function(graphObject){

			$("#datasetInfobt").click(function(){

				var toDialog = '<div id="divinfoDataset"></div>';

	        	$('#dialog').empty();
				$('#dialog').append(toDialog);

				var table = {};
				table.headers = ['Data Set Name', 'Data Set Size', 'Type', 'Metadata', 'Max. Link Distance'];
				if (graphObject.graphInput.data_type == 'profile' || graphObject.graphInput.data_type == 'fasta') table.headers.push('Profile Size');
				table.data = [[graphObject.graphInput.dataset_name, graphObject.graphInput.nodes.length, graphObject.graphInput.data_type]];

				if (graphObject.graphInput.metadata.length > 0) table.data[0].push('True');
				else table.data[0].push('False');

				table.data[0].push(graphObject.maxLinkValue);

				if (graphObject.graphInput.data_type == 'profile' || graphObject.graphInput.data_type == 'fasta'){
					table.data[0].push(graphObject.graphInput.nodes[0].profile.length);
				}

				
				constructTable(graphObject.graphInput, table, 'infoDataset', function(){
					$('#tableinfoDataset tfoot').remove();
				});

				$('#dialog').dialog({
			              height: $(window).height() * 0.20,
			              width: $(window).width(),
			              modal: true,
			              resizable: true,
			              dialogClass: 'no-close success-dialog'
			          });


			});

		},

		numberOfNodes: function(graphObject){

			var graph = graphObject.graphInput;

			$('#numberOfNodes').append(' <b>' + graph.nodes.length + '</b>');

		},

		profileLength: function(graphObject){

			var profileLength = graphObject.graphInput.nodes[0].profile.length;

			$('#countProfileSize').append(' <b>' + profileLength + '</b>');

		},

		datasetName: function(graphObject){

			var graph = graphObject.graphInput;

			$('#datasetNameDiv').append(' <b>'+ graph.dataset_name + '</b>');

		},

		resetPositionButton: function(graphObject){
			$('#resetPositionButton').click(function(e) {
				graphObject.renderer.reset();
				graphObject.renderer.reset();
				graphObject.adjustLabelPositions();
				nodePosition=graphObject.layout.getNodePosition(graphObject.TopNode.id);
				//graphObject.layout.setNodePosition(graphObject.TopNode.id, 0, 0);
				graphObject.renderer.moveTo(nodePosition.x,nodePosition.y);
				graphObject.graphFunctions.adjustScale(graphObject);
				graphObject.graphFunctions.launchGraphEvents(graphObject);

				if(graphObject.isLayoutPaused){
			        graphObject.renderer.resume();
			        setTimeout(function(){ graphObject.renderer.pause();}, 50);
			    }
			});
		},

		pauseButton: function(graphObject){

			var graph = graphObject.graphInput;
			var renderer = graphObject.renderer;
			graphObject.isLayoutPaused = false;

			setTimeout(function(){

				if (Object.keys(graph.positions).length > 0){
			        renderer.pause();
					graphObject.isLayoutPaused = true;

			        $('#pauseLayout')[0].innerHTML = "Resume Layout";
			        $('#iconPauseLayout').toggleClass('glyphicon glyphicon-pause',false);
			        $('#iconPauseLayout').toggleClass('glyphicon glyphicon-play',true);
			    }

			}, 500);

		    $('#pauseLayout').click(function(e) {
	              e.preventDefault();
	              if(!graphObject.isLayoutPaused){
	                renderer.pause();
	                graphObject.isLayoutPaused = true;
	                $('#pauseLayout')[0].innerHTML = "Resume Layout";
	                $('#iconPauseLayout').toggleClass('glyphicon glyphicon-pause',false);
	                $('#iconPauseLayout').toggleClass('glyphicon glyphicon-play',true);
	              }
	              else{ 
	                renderer.resume();
	                graphObject.isLayoutPaused = false;
	                $('#pauseLayout')[0].innerHTML = "Pause Layout";
	                $('#iconPauseLayout').toggleClass('glyphicon glyphicon-play',false);
	                $('#iconPauseLayout').toggleClass('glyphicon glyphicon-pause',true);
	                
	              }
	        });
		},


		graphicButtons: function(graphObject){

			$('#AddLinkLabels').prop('checked', false);
			$('#AddLabels').prop('checked', false);

			$('#NodeSizeSlider').change(function(e){
	            NodeSize(this.value, this.max, graphObject);
	        });

          	$('#NodeLabelSizeSlider').change(function(e){
            	LabelSize(this.value, graphObject, graphObject.nodeLabels, 'node');
          	});

          	$('#LinkLabelSizeSlider').change(function(e){
            	LabelSize(this.value, graphObject, graphObject.linkLabels, 'link');
          	});

          	$('#scaleLink').change(function(e){
            	scaleLink(this.value, graphObject);
          	});

          	$('#scaleNode').change(function(e){
            	scaleNodes(this.value, graphObject);
          	});

          	$("#SpringLengthSlider").attr({
		         "max" : graphObject.maxLinkValue,
		    });

          	$('#SpringLengthSlider').change(function(e){
	            changeSpringLength(this.value, this.max, graphObject);
	        });

	        $('#DragSlider').change(function(e){
	            changeDragCoefficient(this.value, this.max, graphObject);
	        });

	        $('#SpringCoefSlider').change(function(e){
	            changeSpringCoefficient(this.value, this.max, graphObject);
	        });

	        $('#GravitySlider').change(function(e){
	            changeGravity(this.value, this.max, graphObject);
	        });

	        $('#ThetaSlider').change(function(e){
	            changeTheta(this.value, this.max, graphObject);
	        });

	        $('#MassSlider').change(function(e){
	            changeMass(this.value, this.max, graphObject);
	        });

	        $('#resetLayout').on('click', function(e){

	        	$("#ThetaSlider").val(graphObject.defaultLayoutParams.theta);
	        	$("#GravitySlider").val(graphObject.defaultLayoutParams.gravity);
	        	$("#DragSlider").val(graphObject.defaultLayoutParams.dragCoeff);
	        	$("#SpringCoefSlider").val(graphObject.defaultLayoutParams.springCoeff);
	        	$("#MassSlider").val(graphObject.defaultLayoutParams.massratio);

	        	changeMass(graphObject.defaultLayoutParams.massratio, 20, graphObject);
	        	changeTheta(graphObject.defaultLayoutParams.theta, 100, graphObject);
	        	changeGravity(graphObject.defaultLayoutParams.gravity, 1, graphObject);
	        	changeSpringCoefficient(graphObject.defaultLayoutParams.springCoeff, 10, graphObject);
	        	changeDragCoefficient(graphObject.defaultLayoutParams.dragCoeff, 100, graphObject);
	        });


	        $('#AddLabels').change(function(e){
	            if (this.checked){
	              if(navigator.userAgent.toLowerCase().indexOf('firefox') > -1){
	           	  	
	           	  	$('#dialog').empty();
	           	  	var toAppend = '<div style="width:100%;height:50%;text-align:center;"><p>Using this web browser, you might experience some performance loss when adding labels. Do you wish to continue?</p><br><button id="yesLabels" class="btn btn-primary">Yes</button><button id="noLabels" class="btn btn-danger">No</button></div>';

	           	  	$('#dialog').append(toAppend);
	           	  	$('#dialog').dialog();

	           	  	$('#yesLabels').click(function(){
	           	  		AddNodeLabels(graphObject);
	           	  		$('#dialog').dialog('close');
	           	  	});
	           	  	$('#noLabels').click(function(){
	           	  		$('#AddLinkLabels').prop('checked', false);
	           	  		$('#dialog').dialog('close');

	           	  	});
	           	  }
	           	  else AddNodeLabels(graphObject);
	            } 
	            else{
	              $('.node-label').css('display','none');
	              graphObject.tovisualizeLabels = false;
	            } 
          	});

          	$('#AddLogScaleNodes').change(function(e){
	            if (this.checked){
	              graphObject.isLogScaleNodes = true;	
	              changeLogScaleNodes(graphObject);
	            } 
	            else{
	              graphObject.isLogScaleNodes = false;	
	              changeLogScaleNodes(graphObject);
	            } 
          	});

          	$('#AddLogScale').change(function(e){
	            if (this.checked){
	              graphObject.isLogScale = true;	
	              changeLogScale(graphObject);
	            } 
	            else{
	              graphObject.isLogScale = false;	
	              changeLogScale(graphObject);
	            } 
          	});

          	$('#AddLinkLabels').change(function(e){
	            if (this.checked){
	           	  if(navigator.userAgent.toLowerCase().indexOf('firefox') > -1){
	           	  	console.log(navigator.userAgent.toLowerCase());
	           	  	$('#dialog').empty();
	           	  	var toAppend = '<div style="width:100%;height:50%;text-align:center;"><p>Using this web browser, you might experience some performance loss when adding labels. Do you wish to continue?</p><br><button id="yesLabels" class="btn btn-primary">Yes</button><button id="noLabels" class="btn btn-danger">No</button></div>';

	           	  	$('#dialog').append(toAppend);
	           	  	$('#dialog').dialog();

	           	  	$('#yesLabels').click(function(){
	           	  		AddLinkLabels(graphObject);
	           	  		$('#dialog').dialog('close');
	           	  	});
	           	  	$('#noLabels').click(function(){
	           	  		$('#AddLinkLabels').prop('checked', false);
	           	  		$('#dialog').dialog('close');

	           	  	});
	           	  }
	           	  else AddLinkLabels(graphObject);
	            } 
	            else{
	              if(graphObject.graphInput.data_type != "newick") $('#divselectLabelType').css({"display": "none"});
	              $('#divselectLabelType').css({"display": "none"});
	              $('.link-label').css('display','none');
	              graphObject.tovisualizeLinkLabels = false;
	            } 
          	});

          	$('#labelType').change(function(e){
          		if(this.value == 'relative'){

          			var profileSize = graphObject.graphInput.nodes[0].profile.length;

          			graphObject.graphGL.forEachLink(function(link) {
                      //console.log(link.id);
                      graphObject.linkLabels[link.id].innerText = (parseFloat(graphObject.linkLabels[link.id + 'default']) / profileSize).toFixed(2);                    
                  	});

          		}
          		else{
          			var profileSize = graphObject.graphInput.nodes[0].profile.length;

          			graphObject.graphGL.forEachLink(function(link) {
                      //console.log(link.id);
                      graphObject.linkLabels[link.id].innerText = parseInt(graphObject.linkLabels[link.id + 'default']);                    
                  	});
          		}
          	});

          	$('#labelTypeNewick').change(function(e){
          		if(this.value == 'bootstrap'){

          			graphObject.graphGL.forEachLink(function(link) {
                      graphObject.linkLabels[link.id].innerText = link.data.bootstrap;                    
                  	});

          		}
          		else{
          			graphObject.graphGL.forEachLink(function(link) {
                      graphObject.linkLabels[link.id].innerText = link.data.value;                    
                  	});
          		}
          	});

          	$('#zoomIn').click(function(){
          		graphObject.renderer.zoomIn();
          	});

          	$('#zoomOut').click(function(){
          		graphObject.renderer.zoomOut();
          	});

		},


		operationsButtons: function(graphObject){

			if (graphObject.graphInput.isPublic == true){
				$('#generatePublicLinkButton').html('Revoke Public Link');
			} 

			$('#distanceButton').click(function(e){
				if (graphObject.selectedNodes.length < 2) alert('To compute distances, first you need to select more than one node.');
				else if (graphObject.selectedNodes.length >= 500) alert('To much nodes selected. The maximum number is currently 500.');
	            else{
	            	if(graphObject.graphInput.data_type == 'newick') getNewickDistances(graphObject);
	            	else checkLociDifferences(graphObject);
	            }
	        });

	        $('#savePositionsButton').click(function(e){
	            saveTreePositions(graphObject);
	        });

	        $('#createSubset1').click(function(e){

	        	var toDialog = '<div style="text-align: center;"><label>Subset information:</label></div>' + 
	        					'<h5>Dataset Name</h5>' +
								'<input class="form-control input-sm" id="datasetNameSubset" type="text" placeholder="Select a name for the dataset" required/>'+
								'<h5>Dataset Description</h5>' +
								'<input class="form-control input-sm" id="dataset_description_Subset" type="text" placeholder="Description"/>' + 
								'<br>'+ 
								'<div style="width:20%;float:center";><button id="okButtonsubset" class="btn btn-primary btn-md">OK</button></div>'+
	        					'</div>';

	        	$('#dialog').empty();
				$('#dialog').append(toDialog);
				$('#dialog').dialog({
			              height: $(window).height() * 0.30,
			              width: $(window).width() * 0.40,
			              modal: true,
			              resizable: true,
			              dialogClass: 'no-close success-dialog'
			          });

				$('#okButtonsubset').click(function(){
					var datasetN = $('#datasetNameSubset').val();
					var descriptionS = $('#dataset_description_Subset').val();
					toFiles = selectedDataToString(graphObject);
	            	createSubset(toFiles, datasetN, descriptionS);
				});
	        });

	        $('#viewSequences').click(function(e){
	            createMSA(graphObject);
	        });

	        $('#updateMetadata').click(function(e){
	            updateMetadata(graphObject);
	        });

	        $('#Choosecategories').click(function(e){
	            chooseCategories(graphObject, graphObject.linkMethod);
	        });

	        $('#generatePublicLinkButton').click(function(e){
	            PublicLink(graphObject);
	        });

	        $('#getLinkButton').click(function(e){
	        	getLink(graphObject);
	        });

	        $('#exportSelectedDataButton').click(function(e){
	            exportSelectedDataTree(graphObject);
	        });

	        $('#saveImageButton1').click(function(e){
	        	
	        	var toDialog = '<div style="text-align: center;"><label>Only what is visible on the screen will appear on the pdf. Make sure to re-center the tree or adjust the positioning before printing.</label></div>' + 
	        					'<div id="buttonoptionsdiv" style="width:90%;position:absolute;bottom:2px;text-align:center;">' + 
	        					'<div style="width:20%;float:left";><button id="cancelButtonPDF" class="btn btn-danger btn-md">Cancel</button></div>' +  
	        					'<div style="width:20%;float:right";><button id="okButtonPDF" class="btn btn-primary btn-md">OK</button></div>' +  
	        					'</div>';

	        	$('#dialog').empty();
				$('#dialog').append(toDialog);
				$('#dialog').dialog({
			              height: $(window).height() * 0.15,
			              width: $(window).width() * 0.2,
			              modal: true,
			              resizable: true,
			              dialogClass: 'no-close success-dialog'
			          });

				$('#okButtonPDF').click(function(){
					printDiv(graphObject);
				});

				$('#cancelButtonPDF').click(function(){
					$('#dialog').dialog("close");
				});

	        });

	        $("#SplitTreeSlider").attr({
		        "max" : graphObject.maxLinkValue,
		        "value" : graphObject.maxLinkValue 
		    });

		    $("#NLVnumber").attr({
		        "max" : graphObject.graphInput.maxDistanceValue,
		        "value" : 0
		    });

	        $('#SplitTreeSlider').change(function(e){
	            splitTree(graphObject, this.value);
	        });

	        $('#NLVnumber').change(function(e){
            	NLVgraph(graphObject, this.value);
          });

		},

		searchButton: function(graphObject){

			$('#searchForm').submit(function(e) {
                  e.preventDefault();
                  var nodeId = $('#nodeid').val();
                  centerNode(nodeId, graphObject);
              });
		}

	}
}

function AddLinkLabels(graphObject){

  $('#divselectLabelType').css({"display": "block"});
  $('.link-label').css('display','block');
  if(graphObject.graphInput.data_type != "newick") {
  	$('#labelType').css({"display": "block"});
  	$('#labelTypeNewick').css({"display": "none"});
  }
  else{
  	$('#labelType').css({"display": "none"});
  	$('#labelTypeNewick').css({"display": "block"});
  }
  for (i in graphObject.removedLinks){
    var labelStyle = graphObject.linkLabels[graphObject.removedLinks[i].id].style;
    labelStyle.display = "none";
  }
  graphObject.tovisualizeLinkLabels = true;
  if(graphObject.isLayoutPaused == true){
  	graphObject.renderer.resume();
	setTimeout(function(){ graphObject.renderer.pause();}, 50);
  }
  else graphObject.renderer.resume();

}

function AddNodeLabels(graphObject){
  $('.node-label').css('display','block');
  graphObject.tovisualizeLabels = true;
  if(graphObject.isLayoutPaused == true){
  	graphObject.renderer.resume();
	setTimeout(function(){ graphObject.renderer.pause();}, 50);
  }
  else graphObject.renderer.resume();
}