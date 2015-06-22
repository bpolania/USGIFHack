
import json
import pymongo
from pymongo import MongoClient


client = MongoClient()
client = MongoClient('localhost', 27017)



with open('main.json') as json_data:
	parsed_json = json.load(json_data)

#json_string = '{"first_name": "Guido", "last_name":"Rossum"}'

db = client['usgif']
posts = db['mainCollection']

elements = []

for element in parsed_json:
	post_id = posts.insert_one(element).inserted_id
	post_id
		



