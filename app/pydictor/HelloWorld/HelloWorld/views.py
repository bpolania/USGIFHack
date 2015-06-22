
# Create your views here.
import httplib2

import urlparse
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import get_object_or_404, render
from django.template import RequestContext, loader
from apiclient.discovery import build

from oauth2client.client import flow_from_clientsecrets
from oauth2client.file import Storage
from oauth2client import tools

import nltk   
from urllib import urlopen
from bs4 import BeautifulSoup
import requests



def foo(request):
	template = loader.get_template('index.html')
	return HttpResponse(template.render())


def index(request):
	# Create a query statement and query request object


	PROJECT_NUMBER = '988448937628'


	FLOW = flow_from_clientsecrets('client_secrets.json', scope='https://www.googleapis.com/auth/bigquery')

	storage = Storage('bigquery_credentials.dat')
	credentials = storage.get()

	if credentials is None or credentials.invalid:
  	# Run oauth2 flow with default arguments.
  		
  		credentials = tools.run_flow(FLOW, storage, tools.argparser.parse_args([]))

	http = httplib2.Http()
	http = credentials.authorize(http)

	service = build('bigquery', 'v2', http=http)

	query_data = {"query":"SELECT * FROM [gdelt-bq:full.events] WHERE Actor1CountryCode = 'NGA' AND SOURCEURL != 'unspecified' AND ActionGeo_Lat IS NOT NULL AND ActionGeo_Long IS NOT NULL AND (SOURCEURL contains 'ebola') LIMIT 1;"}
	query_request = service.jobs()

	# Retrieve and print the result of the query API response
	query_response = query_request.query(projectId=PROJECT_NUMBER, body=query_data).execute()

	result = []
	print 'Query Results:'
	for row in query_response['rows']:
		result_row = []
		result_row.append(row['f'][39])
		result_row.append(row['f'][40])
		result_row.append(row['f'][-1])
		url = row['f'][-1]['v']
		print row['f'][-1]['v']    
		html = urlopen(url).read() 
		soup = BeautifulSoup(html)
		r = requests.post("http://localhost:3000", data={'sid': 'ie-en-news', 'txt' : soup.find('body').get_text()})
		print(r.status_code, r.reason)
		result.append(result_row)


	return HttpResponseRedirect("http://localhost:3030/maps")
	#return ('\t').join(result_row))