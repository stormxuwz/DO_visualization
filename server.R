library(shiny)
library(RMySQL)
library(dygraphs)
library(zoo)
library(reshape2)
library(leaflet)
library(RColorBrewer)
library(plotly)
library(sp)
library(gstat)
library(raster)
# conn <- dbConnect(MySQL(), dbname = "DO2014", username="root", password="XuWenzhaO", host="127.0.0.1", port=3306)
# geoLocation <- dbReadTable(conn,"loggerInfo")


sqlQuery <- function (sql,year) {
		  #conn <- dbConnect(MySQL(), dbname = paste("DO",year,sep=""), username="root", password="XuWenzhaO", host="127.0.0.1", port=3306)
      conn <- dbConnect(MySQL(), dbname = "DO", username="root", password="XuWenzhaO", host="127.0.0.1", port=3306)
      result <- dbGetQuery(conn,sql)
		  # cat(sql)
		  dbDisconnect(conn)
		  # return the dataframe
		  return(result)
}
emptyData <- zoo(c(rep(NA, 4)),order.by=as.Date(c("2014-1-1","2014-1-2")))

# ID <- input$selectedID

shinyServer(function(input,output,session)
{

	# Plot the map
	output$mymap <- renderLeaflet({
       		leaflet("mymap") %>% clearShapes() %>% addTiles() %>% fitBounds(-82.41, 41.59,-80.75, 42.43)
    })
	
	observe({
    	updateSelectizeInput(session, 'selectedID', choices = unique(geoData()[,"loggerID"]), selected=NULL,server = FALSE)
	})
	

	visData <- reactive({
	  year <- input$year
		tmp <- input$selectedID
		tmp <- paste("logger =",tmp)
		tmp <- paste(tmp,collapse=" OR ")
		tmp <- sprintf("(%s)",tmp)
		var <- input$var
		if(input$dataType=="STD" & input$GroupRange=="daily"){
			sql <- sprintf("Select date(Time) as Time, STD(%s) as %s, logger from loggerData_%s where %s Group by date(Time),logger",var,var,year,tmp)
			print(sql)
			timeFormat="%Y-%m-%d"
		}
		else if(input$dataType=="STD" & input$GroupRange=="hourly"){
			sql <- sprintf("Select DATE_FORMAT(Time,'%%Y-%%m-%%d %%H') as Time, STD(%s) as %s, logger from loggerData_%s where %s Group by DATE_FORMAT(Time,'%%Y-%%m-%%d %%H'),logger",var,var,year,tmp)
			# print(sql)
			timeFormat="%Y-%m-%d %H"
		}
		else if(input$dataType=="AVG" & input$GroupRange=="daily"){
			sql <- sprintf("Select date(Time) as Time, AVG(%s) as %s, logger from loggerData_%s where %s Group by date(Time),logger",var,var,year,tmp)
			# print(sql)
			timeFormat="%Y-%m-%d"
		}
		else if(input$dataType=="AVG" & input$GroupRange=="hourly"){
			sql <- sprintf("Select DATE_FORMAT(Time,'%%Y-%%m-%%d %%H') as Time, AVG(%s) as %s, logger from loggerData_%s where %s Group by DATE_FORMAT(Time,'%%Y-%%m-%%d %%H'),logger",var,var,year,tmp)
			# print(sql)
			timeFormat="%Y-%m-%d %H"
		}
		else{
			sql <- sprintf("Select Time, %s, logger from loggerData_%d where %s",var,year,tmp)
			timeFormat="%Y-%m-%d %H:%M:%S"
		}
		data <- sqlQuery(sql,input$year) %>% dcast(Time~logger,value.var=var)
		# print(data)
		data <- zoo(subset(data,select=-Time),order.by=strptime(data$Time,format=timeFormat,tz="GMT"))

		return(data)
	})

	geoData <- reactive({
		year <- input$year
		sql <- sprintf("select longitude,latitude,loggerID,bathymetry from loggerInfo where available=1 and loggerPosition='B' and year = %s", year)
   		mydata <- sqlQuery(sql,year)
   		return(mydata)
 	})

	colorpal <- reactive({

	  colorNumeric(input$colors, geoData()$bathymetry)
	    
  	})

	observe({
	   if(input$mapData=="Bathy"){
		   	pal <- colorpal()
		   	# print(isolate(input$mapData))
		   	mygeodata <- geoData()
		   	# print(mygeodata)
		    leafletProxy("mymap", data = mygeodata) %>% clearShapes() %>% addCircles(layerId=~loggerID,lng=~longitude,lat=~latitude,radius = 3000, weight = 1, color = "#777777",fillColor = ~pal(bathymetry), fillOpacity = 0.8)
			# leafletProxy("mymap", data = mygeodata) %>% clearShapes() %>% addMarkers(layerId=~loggerID,lng=~longitude,lat=~latitude)
	   } 
  	})

	observe({
		click<-input$mymap_shape_click
   	 	if(is.null(click))
          return()

		leafletProxy("mymap")%>%addPopups(click$lng,click$lat, paste(click$id),options=popupOptions(maxHeight=20,zoomAnimation=FALSE))

       	# use isolate to avoid repeat call to input$selectedID
    	ID <- isolate(input$selectedID)
    	updateSelectizeInput(session, 'selectedID', choices = unique(isolate(geoData())[,"loggerID"]), selected= c(ID,click$id), server = FALSE)
	})


	observe({
    	leafletProxy("mymap",data=geoData()) %>% clearControls() %>% addLegend(position = "bottomright", pal = colorpal(), values = ~bathymetry)
  	})



	output$timeSeriesPlot <- renderDygraph({
		tmp <- input$selectedID

		lastData <- subset(geoData(),loggerID %in% as.numeric(tmp))

		var <- input$var
		if(is.null(tmp)){
			leafletProxy("mymap")%>%clearPopups()
			return(dygraph(emptyData) %>% dyRangeSelector())
		}

		leafletProxy("mymap")%>%clearPopups()%>%addPopups(data=lastData,lng=~longitude,lat=~latitude,paste(lastData$loggerID),
			options=popupOptions(maxHeight=20,zoomAnimation=FALSE))
		
		data <- visData()
		if(input$scale){
			data <- scale(data)
		}

		if(!input$twoy){
			dygraph(data, main = "Time Series") %>% dyRangeSelector(retainDateWindow=TRUE)
		}
		else{
			if(length(tmp)==2){
				name2=names(data)[2]
				dygraph(data, main = "Time Series") %>% dyRangeSelector(retainDateWindow=TRUE) %>%  dySeries(name2, axis = 'y2')
			}
		}
	})

	output$corr <- renderTable({
		if(is.null(input$selectedID))
			return()
		if(input$dataType=="Raw")
			return()
		# if(input$var==""){}
		return(cor(visData(),use="pairwise.complete.obs"))
	})


	spatialData <- reactive({
		tmp <- input$selectedID
		tmp <- paste("logger =",tmp)
		tmp <- paste(tmp,collapse=" OR ")
		var <- input$var

		QueryDay <- input$myDate
		QueryHour <- input$myHour

		# print("hello")
		if(input$GroupRange=="daily"){
			sql <- sprintf("Select date(Time) as Time, AVG(%s) as %s, logger from loggerData where (%s) and date(Time) = '%s' Group by date(Time),logger",var,var,tmp,QueryDay)
		}
		else{
			sql <- sprintf("Select date(Time) as Time, AVG(%s) as %s, logger from loggerData where (%s) and date(Time) = '%s' Group by date(Time),logger",var,var,tmp,QueryDay)

		}
		# print(sql)
		data <- sqlQuery(sql,input$year)
		data <- merge(data,geoData(),by.x = "logger", by.y = "loggerID",all.y = FALSE)
		data$id <- 1:nrow(data)
		return(data)
	})

	output$Variogram <- renderPlotly({
		if(is.null(input$selectedID)){
			return()
		}
		if(length(input$selectedID)<3){
			return()
		}
		spdata <- spatialData()
		names(spdata)[3]="var"
		coordinates(spdata)= ~longitude+latitude
		projection(spdata)=CRS("+init=epsg:4326")
		#print(spdata)
		eq <- paste("var",input$equation)
		#print(eq)
		v <- data.frame(variogram(as.formula(eq),data=spdata,cloud=T,cutoff=10000))
		# print(v)
		v$leftLogger <- spdata$logger[v$left]
		v$rightLogger <- spdata$logger[v$right]

		v$leftValue <- spdata$var[v$left]
		v$rightValue <- spdata$var[v$right]

		p <- plot_ly(v, x = dist, y=gamma, mode="markers",hoverinfo = "text",
          text = paste(v$leftLogger,"(",round(v$leftValue,2),")--",v$rightLogger,"(",round(v$rightValue,2),")",sep=""))
		p

	})

})