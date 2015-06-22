import nltk   
from urllib import urlopen
from bs4 import BeautifulSoup
import requests


url = "http://news.bbc.co.uk/2/hi/health/2284783.stm"    
html = urlopen(url).read() 
soup = BeautifulSoup(html)
r = requests.post("http://localhost:3000", data={'sid': 'ie-en-news', 'txt' : soup.find('body').get_text()})
print(r.status_code, r.reason)
#print(soup.find('body').get_text())