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
	parser.add_argument('-sdt', nargs='?', type=str, help='Sequence data type (newick, profile, fasta)', required=True)
	parser.add_argument('-sd', nargs='?', type=str, help='Sequence data', required=True)
	parser.add_argument('-m', nargs='?', type=str, help="Metadata", required=False)
	parser.add_argument('-d', nargs='?', type=str, help="Dataset name", required=True)
	parser.add_argument('-dn', nargs='?', type=str, help="Description", required=False)

	args = parser.parse_args()

	checkDatasets(args)
	datasetID = remoteUpload(args)
	rungoeBURST(args, datasetID)

	print 'DONE'

def login(args):

	bashCommand = 'curl --cookie-jar jarfile --data username='+ args.u + '&' + 'password=' + args.p + ' http://localhost:3000/users/api/login'
	process = subprocess.Popen(bashCommand.split(), stdout=subprocess.PIPE)
	output = process.communicate()[0]


def checkDatasets(args):
	print 'Checking if dataset name exists...'
	login(args)

	bashCommand = 'curl --cookie jarfile -X GET http://localhost:3000/api/db/postgres/find/datasets/name?name='+ args.d
	process = subprocess.Popen(bashCommand.split(), stdout=subprocess.PIPE)
	output = process.communicate()[0]
	io = StringIO(output)
	existingdatasets = json.load(io)

	if len(existingdatasets['userdatasets']) > 0:
		print 'dataset name already exists'
		sys.exit()

def remoteUpload(args):
	print 'Uploading files...'

	login(args)

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
	
	bashCommandUpload = 'curl --cookie jarfile \
					  -F datasetName='+ datasetName +' \
					  -F dataset_description='+ description +' \
					  -F makePublic='+ makePublic +' \
					  ' + dataToAdd + ' \
					  ' + addMetadata + ' \
					  -F numberOfFiles='+ str(numberOfFiles) +' \
					  http://localhost:3000/api/db/postgres/upload'

	process = subprocess.Popen(bashCommandUpload.split(), stdout=subprocess.PIPE)
	output = process.communicate()[0]

	return output

def rungoeBURST(args, datasetID):

	login(args)

	print 'Running goeBURST...'

	bashCommand = 'curl --cookie jarfile -X GET http://localhost:3000/api/algorithms/goeBURST?dataset_id='+ datasetID + '&save=true'

	process = subprocess.Popen(bashCommand.split(), stdout=subprocess.PIPE)
	output = process.communicate()[0]

if __name__ == "__main__":
    main()

