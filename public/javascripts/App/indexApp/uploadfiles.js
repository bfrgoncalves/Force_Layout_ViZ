
function status(message) {
    $('#status').text(message);
}


function submitTree(NameToID){

    var tablepublic = $('#tablepublic').DataTable();
    var publicselectedrow = tablepublic.rows('.selected').data();

    var tableuser = $('#tableuser').DataTable();
    var userselectedrow = tableuser.rows('.selected').data();

    if(publicselectedrow[0] != undefined){
      window.location.replace("/main/dataset/public/" + NameToID["public"][0][publicselectedrow[0][0]]);
    }
    else if(userselectedrow[0] != undefined){
      window.location.replace("/main/dataset/" + NameToID["user"][0][userselectedrow[0][0]]);
    }
    else if ($('#datasetName').val() == '') $('#status').text('Dataset name is required.');
    else if ($('#possibleInputFormats').find(":selected")[0].index == 1 && $('#uploadProfile').val() == '') $('#status').text('Profile file is required.');
    else if ($('#possibleInputFormats').find(":selected")[0].index == 2 && $('#uploadNewick').val() == '')  $('#status').text('Newick file is required.');
    else $('#inputForm').submit();
    
}

$('#inputForm').submit(function() {

    var datasetName = $('#datasetName').val();
    checkIfNameExists(datasetName, function(){
      uploadFiles();
    });

    return false;
});


function uploadFiles(){

  status('Uploading files...');

  var img = document.getElementById('GIFimage');
  $("#GIFimage").attr("src", 'images/waitingGIF.gif').attr('width' , '50px').attr('height' , '50px');
  $("#waitingGif").css({'display': 'block'});


  //event.preventDefault();

  var form = document.getElementById('inputForm');
  var fileSelectProfile = document.getElementById('uploadProfile');
  var fileSelectMetadata = document.getElementById('uploadMetadata');
  var fileSelectNewick = document.getElementById('uploadNewick');
  var fileSelectFasta = document.getElementById('uploadFasta');
  var datasetName = document.getElementById('datasetName');
  var makePublic = document.getElementById('makepublic').checked;

  countNumberOfFiles = 0;

  if (fileSelectNewick.files[0] != undefined) countNumberOfFiles += 1;
  if (fileSelectProfile.files[0] != undefined) countNumberOfFiles += 1;
  if (fileSelectMetadata.files[0] != undefined) countNumberOfFiles += 1;
  if (fileSelectFasta.files[0] != undefined) countNumberOfFiles += 1;

  
  var fd = new FormData();    
  fd.append( 'fileProfile', fileSelectProfile.files[0] );
  fd.append( 'fileMetadata', fileSelectMetadata.files[0] );
  fd.append( 'fileNewick', fileSelectNewick.files[0] );
  fd.append( 'fileFasta', fileSelectFasta.files[0] );
  fd.append( 'datasetName', $('#datasetName').val());
  fd.append( 'dataset_description', $('#dataset_description').val());
  fd.append( 'numberOfFiles', countNumberOfFiles);
  fd.append( 'makePublic', makePublic);
  

  $.ajax({
    url: '/api/db/postgres/upload',
    data: fd,
    processData: false,
    contentType: false,
    type: 'POST',
    success: function(data){

      if(data.hasError == true){
        $("#dialog").empty();
        $("#dialog").append('<p>' + data.errorMessage + '</p>');
        status('');
        $("#waitingGif").css({'display': 'none'});
        $("#dialog").dialog({
          width: 500,
          height: 300
        });
      }
      else{
        if (fileSelectNewick.files[0] != undefined) window.location.replace("/main/dataset/" + data.datasetID);
        else getLinks(data.datasetID);
        status('Computing links...');
      }
    }

  });
  

}

function getLinks(datasetID){

  /*
  client_goeburst(datasetID, function(data){
    if(data.dupProfiles.length > 0 || data.dupIDs.length >0){
        popDialog(data);
      }
      else{
        status('Done!');
        window.location.replace("/main/dataset/" + data.datasetID);
      }
  });
*/

  
  $.ajax({
    url: '/api/algorithms/goeBURST',
    data: $.param({dataset_id: datasetID, save: true}),
    processData: false,
    contentType: false,
    type: 'GET',
    success: function(data){
      if(data.dupProfiles.length > 0 || data.dupIDs.length >0){
        popDialog(data);
      }
      else{
        status('Done!');
        window.location.replace("/main/dataset/" + data.datasetID);
      }
    }

  });

}

function popDialog(data){
  var toShow = '<p>Duplicate profiles:' ;
  var interText = '';
  var countD = 0;
  
  for (i in data.dupProfiles){
    countD ++;
    interText += '<p>ID - ' + data.dupProfiles[i][0] + ', Profile: ' + data.dupProfiles[i][1] + '</p>';
  }
  toShow += String(countD) + '\n';
  toShow += interText + '</p>';
  countD = 0;
  interText = '';
  toShow += '<br><p>Duplicate IDs:' ;
  
  for (i in data.dupIDs){
    countD ++;
    interText += '<p>ID - ' + data.dupIDs[i] + '</p>';
  }
  toShow += String(countD) + '\n';
  toShow += interText + '</p>';

  var buttons = '';

  if(data.dupIDs.length > 0){
    toShow += '<br>Since there are multiple profiles with same ID, only the first one is used. Do you wish to continue anyway?'
    buttons += '<button id="cancelButton" class="btn btn-danger" style="margin:1%;">Cancel</button>';
  }
  buttons += '<button id="acceptButton" class="btn btn-info" style="margin:1%;">Ok</button>';

  $('#dialog').empty();

  var a = $('<p>' + toShow + '</p>');
  var b = $(buttons);
  $('#dialog').append(a);
  $('#dialog').append(b);
  $('#dialog').dialog();

  $('#acceptButton').click(function(){
    status('Done!');
    window.location.replace("/main/dataset/" + data.datasetID);
  });

  $('#cancelButton').click(function(){
      eraseDataset(data);
      status('');
      $("#waitingGif").css({'display': 'none'});
      $('#dialog').dialog('close');
  });
}


function eraseDataset(data){

  $.ajax({
      url: '/api/db/postgres/delete',
      data: {dataset_id: data.datasetID},
      type: 'DELETE',
      success: function(data){
        console.log('dataset deleted');
      }

    });
}




function checkIfNameExists(datasetName, callback){
    
    status('Checking if dataset exists...');

    $.ajax({
      url: '/api/db/postgres/find/datasets/name',
      data: $.param({name: datasetName}),
      processData: false,
      contentType: false,
      type: 'GET',
      success: function(data){
        if(isUser && data.userdatasets.length > 0 || !isUser && data.publicdatasets.length > 0) status('Dataset name already exists!');
        else callback();
      }

    });
}


