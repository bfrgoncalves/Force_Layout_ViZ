import subprocess
import argparse
import os
import shutil
from os import listdir
from os.path import isfile, join, isdir
import sys
from datetime import datetime
import json
from StringIO import StringIO


def main():

	parser = argparse.ArgumentParser(description="This program performs remote upload of data sets to the PHYLOViZ Online application")
	parser.add_argument('-u', nargs='?', type=str, help="username", required=True)
	parser.add_argument('-p', nargs='?', type=str, help="password", required=True)
	parser.add_argument('-e', nargs='?', type=bool, help="Make public", required=False, default=False)
	parser.add_argument('-l', nargs='?', type=bool, help="Public Link", required=False, default=False)
	parser.add_argument('-sdt', nargs='?', type=str, help='Sequence data type (newick, profile, fasta)', required=True)
	parser.add_argument('-sd', nargs='?', type=str, help='Sequence data', required=True)
	parser.add_argument('-m', nargs='?', type=str, help="Metadata", required=False)
	parser.add_argument('-d', nargs='?', type=str, help="Dataset name", required=True)
	parser.add_argument('-dn', nargs='?', type=str, help="Description", required=False)
        parser.add_argument('-j', nargs='?', type=str, help="Cookie filename", required=False)

	args = parser.parse_args()

	currentRoot = 'http://online.phyloviz.net'

	checkDatasets(args, currentRoot)
	dataset = remoteUpload(args, currentRoot)
	if not "datasetID" in dataset:
		sys.exit()
	rungoeBURST(args, dataset['datasetID'], currentRoot)

	if not args.e and args.l:
		sharableLink = generatePublicLink(args, dataset['datasetID'], currentRoot)
		print 'Sharable link: ' + sharableLink['url']
		sys.exit()

	if args.e:
		print "\nAccess the tree at: " + currentRoot + '/main/dataset/' + dataset['datasetID']
	else:
		print "\nLogin to PHYLOViZ Online and access the tree at: " + currentRoot + '/main/dataset/' + dataset['datasetID']


def login(args, currentRoot): #Required before each of the tasks
 
        if args.j is None:
                args.j = 'jarfile'
        bashCommand = 'curl --cookie-jar ' + args.j + ' --data username='+ args.u + '&' + 'password=' + args.p + ' ' +currentRoot+'/users/api/login'
	process = subprocess.Popen(bashCommand.split(), stdout=subprocess.PIPE)
	output = process.communicate()[0]
	if output == 'Unauthorized':
		print output
		sys.exit()


def checkDatasets(args, currentRoot): #Check if the database name to upload exists
	print 'Checking if dataset name exists...'
	
	login(args, currentRoot)

        bashCommand = 'curl --cookie ' + args.j + ' -X GET '+currentRoot+'/api/db/postgres/find/datasets/name?name='+ args.d
	process = subprocess.Popen(bashCommand.split(), stdout=subprocess.PIPE)
	output = process.communicate()[0]
	io = StringIO(output)
	existingdatasets = json.load(io)

	if len(existingdatasets['userdatasets']) > 0:
		print 'dataset name already exists'
		sys.exit()

def remoteUpload(args, currentRoot): #upload the input files to the database
	print 'Uploading files...'

	login(args, currentRoot)

	addMetadata = ''

	sequenceType = args.sdt
	sequenceData = args.sd

	dataToAdd = ''

	if args.sdt == 'newick':
		dataToAdd = '-F fileNewick=@'+ args.sd
	elif args.sdt == 'fasta':
		dataToAdd = '-F fileFasta=@'+ args.sd
	else:
		dataToAdd = '-F fileProfile=@'+ args.sd

	if args.m:
		metadata = args.m
		numberOfFiles = 2
		addMetadata = '-F fileMetadata=@'+ metadata
	else:
		numberOfFiles = 1
	datasetName = args.d
	if args.dn:
		description = args.dn
	else:
		description = ''

	if args.e:
		makePublic = 'true'
	else:
		makePublic = 'false'

	bashCommandUpload = 'curl --cookie ' + args.j +' \
					  -F datasetName='+ datasetName +' \
					  -F dataset_description='+ description +' \
					  -F makePublic='+ makePublic +' \
					  ' + dataToAdd + ' \
					  ' + addMetadata + ' \
					  -F numberOfFiles='+ str(numberOfFiles) +' \
					  '+currentRoot+'/api/db/postgres/upload'

	process = subprocess.Popen(bashCommandUpload.split(), stdout=subprocess.PIPE)
	output = json.loads(process.communicate()[0])
	if "errorMessage" in output:
		print output["errorMessage"]
		sys.exit()

	return output

def rungoeBURST(args, datasetID, currentRoot): #run the goeBURST algorithm to store the links in the database

	login(args, currentRoot)

	print 'Running goeBURST...'

	bashCommand = 'curl --cookie ' + args.j + ' -X GET '+currentRoot+'/api/algorithms/goeBURST?dataset_id='+ datasetID + '&save=true'

	process = subprocess.Popen(bashCommand.split(), stdout=subprocess.PIPE)
	output = process.communicate()[0]


def generatePublicLink(args, datasetID, currentRoot):

	login(args, currentRoot)
	print 'Generating Sharable Link...'
	#make data set visible
	bashCommand = 'curl --cookie jarfile -X PUT -d dataset_id='+ datasetID + ' -d change=true '+currentRoot+'/api/db/postgres/update/all/is_public'

	process = subprocess.Popen(bashCommand.split(), stdout=subprocess.PIPE)
	output = process.communicate()[0]

	login(args, currentRoot)
	#get sharable link
	bashCommand = 'curl --cookie jarfile -X GET '+currentRoot+'/api/utils/publiclink?dataset_id='+ datasetID
	process = subprocess.Popen(bashCommand.split(), stdout=subprocess.PIPE)
	output = json.loads(process.communicate()[0])
	
	return output


if __name__ == "__main__":
    main()
