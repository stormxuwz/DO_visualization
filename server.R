library(shiny)
library(RMySQL)
library(dygraphs)
library(zoo)
library(reshape2)
library(leaflet)
library(RColorBrewer)

# conn <- dbConnect(MySQL(), dbname = "DO2014", username="root", password="XuWenzhaO", host="127.0.0.1", port=3306)
# geoLocation <- dbReadTable(conn,"loggerInfo")


sqlQuery <- function (sql,year) {
		  conn <- dbConnect(MySQL(), dbname = paste("DO",year,sep=""), username="root", password="XuWenzhaO", host="127.0.0.1", port=3306)
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
    	updateSelectizeInput(session, 'selectedID', choices = unique(geoData()[,"loggerId"]), selected=NULL,server = FALSE)
	})
	

	geoData <- reactive({
		year <- input$year
		sql <- sprintf("select longitude,latitude,loggerId,bathymetry from loggerInfo where available=1 and loggerPosition='B'")
   		mydata <- sqlQuery(sql,year)
   		# print(head(mydata))
   		# print(class(mydata$bathymetry))
		# updateSelectizeInput(session, 'selectedID', choices = unique(mydata[,"loggerId"]), selected=NULL, server = FALSE)

   		return(mydata)
 	})

	colorpal <- reactive({
		#if(input$var=="Temp")
    #		colorNumeric(input$colors, c(10:30))
    #	else{
    #		colorNumeric(input$colors, c(0,18))
    #	}
	  colorNumeric(input$colors, geoData()$bathymetry)
	    
  	})

	observe({
	    pal <- colorpal()
	    #query the data

	    leafletProxy("mymap", data = geoData()) %>%
	      clearShapes() %>%
	      addCircles(layerId=~loggerId,lng=~longitude,lat=~latitude,radius = 3000, weight = 1, color = "#777777",
	        fillColor = ~pal(bathymetry), fillOpacity = 0.8)
  	})

	observe({
		click<-input$mymap_shape_click
   	 	if(is.null(click))
          return()
		# print(click)
		# print(input$mymap_shape_click)
		# leafletProxy("mymap") %>%clearPopups()
		leafletProxy("mymap")%>%addPopups(click$lng,click$lat, paste(click$id),
			options=popupOptions(maxHeight=20,zoomAnimation=FALSE))

       	# use isolate to avoid repeat call to input$selectedID
    	ID <- isolate(input$selectedID)
    	updateSelectizeInput(session, 'selectedID', choices = unique(geoData()[,"loggerId"]), selected= c(ID,click$id), server = FALSE)
	})


	observe({
    	leafletProxy("mymap",data=geoData()) %>% clearControls() %>% addLegend(position = "bottomright", pal = colorpal(), values = ~bathymetry)
  	})



	output$timeSeriesPlot <- renderDygraph({
		tmp <- input$selectedID
		var <- input$var
		if(is.null(tmp)){
			return(dygraph(emptyData) %>% dyRangeSelector())
		}

		tmp <- paste("logger =",tmp)
		tmp <- paste(tmp,collapse=" OR ")
		
		# print(sql)
		if(input$dataType=="STD" & input$GroupRange=="daily"){
			sql <- sprintf("Select date(Time) as Time, STD(%s) as %s, logger from loggerData where %s Group by date(Time),logger",var,var,tmp)
			# print(sql)
			timeFormat="%Y-%m-%d"
		}
		else if(input$dataType=="STD" & input$GroupRange=="hourly"){
			sql <- sprintf("Select DATE_FORMAT(Time,'%%Y-%%m-%%d %%H') as Time, STD(%s) as %s, logger from loggerData where %s Group by DATE_FORMAT(Time,'%%Y-%%m-%%d %%H'),logger",var,var,tmp)
			# print(sql)
			timeFormat="%Y-%m-%d %H"
		}
		else if(input$dataType=="AVG" & input$GroupRange=="daily"){
			sql <- sprintf("Select date(Time) as Time, AVG(%s) as %s, logger from loggerData where %s Group by date(Time),logger",var,var,tmp)
			# print(sql)
			timeFormat="%Y-%m-%d"
		}
		else if(input$dataType=="AVG" & input$GroupRange=="hourly"){
			sql <- sprintf("Select DATE_FORMAT(Time,'%%Y-%%m-%%d %%H') as Time, AVG(%s) as %s, logger from loggerData where %s Group by DATE_FORMAT(Time,'%%Y-%%m-%%d %%H'),logger",var,var,tmp)
			# print(sql)
			timeFormat="%Y-%m-%d %H"
		}
		else{
			sql <- paste("Select Time,",var,", logger from loggerData where ",tmp)
			timeFormat="%Y-%m-%d %H:%M:%S"
		}
		data <- sqlQuery(sql,input$year) %>% dcast(Time~logger,value.var=var)
		# print(data)
		data <- zoo(subset(data,select=-Time),order.by=strptime(data$Time,format=timeFormat))
		# print(head(data))
		
		# timeMiddle <- as.POSIXct(input$myDate)
		# timeStart <- timeMiddle - 12*3600
		# timeEnd <- timeMiddle + 12*3600

		# dygraph(data, main = "Time Series") %>% dyRangeSelector(dateWindow = c(timeStart, timeEnd)) 
		dygraph(data, main = "Time Series") %>% dyRangeSelector()
	})


})