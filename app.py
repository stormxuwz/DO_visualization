from __future__ import print_function # In python 2.7

from flask import Flask,render_template,request
from sqlalchemy import create_engine
import json
import sys
from datetime import datetime

app = Flask(__name__)

SQL_engine_2014 = create_engine("mysql+mysqldb://root:XuWenzhaO@localhost/DO")
SQL_engine_2015 = create_engine("mysql+mysqldb://root:XuWenzhaO@localhost/DO2015")

tab
def returnData(sql,engine):
	print(sql,file=sys.stderr)
	conn=engine.connect()
	results=conn.execute(sql)
	conn.close()
	# print([dict(res) for res in results],file=sys.stderr)
	return [dict(res) for res in results]


@app.route('/queryDO',methods=['POST'])
def queryDO():
	# print(request.json,file=sys.stderr)

	startTime =  request.json['startTime']
	endTime=request.json['endTime']
	
	startTime=datetime.fromtimestamp(startTime/1000).strftime('%Y-%m-%d %H:%M:%S')
	endTime=datetime.fromtimestamp(endTime/1000).strftime('%Y-%m-%d %H:%M:%S')

	sql = "SELECT logger, %s from loggerData where time > \'%s\' AND time < \'%s\' order by loggerID " %('DO',str(startTime),str(endTime))
	
	res = returnData(sql,SQL_engine_2014)

	newConstruct=dict()
	for item in res:
		newConstruct[str(int(item["logger"]))]=[item["DO"]]
	
	return json.dumps(newConstruct)

@app.route('/queryStation/<year>')
def queryStation(year):
	if year=="2014":
		engine=SQL_engine_2014
		sql = "SELECT loggerID,latitude,longitude from loggerInfo where loggerPosition='B' and available=1 order by loggerID"
	else:
		engine=SQL_engine_2015
		sql = "SELECT loggerID,latitude,longitude from loggerInfo where loggerPosition='Bottom' order by loggerID"
	# print(year,file=sys.stderr)
	
	print(engine,file=sys.stderr)
	res = returnData(sql,engine)
	
	# print(res, file=sys.stderr)
	# reconstruct the results
	newConstruct=dict()

	for item in res:
		newConstruct[str(int(item["loggerID"]))]=[item["longitude"],item["latitude"]]
	
	return json.dumps(newConstruct)

@app.route('/')
def index():
	# print('Hello world!', file=sys.stderr)
	return render_template("index.html")

if __name__ == "__main__":
    app.run(host='0.0.0.0',port=5000,debug=True)