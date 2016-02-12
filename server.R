library(shiny)
library(RMySQL)
library(dygraphs)
library(zoo)
library(reshape2)
library(leaflet)
library(RColorBrewer)

# conn <- dbConnect(MySQL(), dbname = "DO2014", username="root", password="XuWenzhaO", host="127.0.0.1", port=3306)
# geoLocation <- dbReadTable(conn,"loggerInfo")


sqlQuery <- function (sql,year=2014) {
  conn <- dbConnect(MySQL(), dbname = "DO2014", username="root", password="XuWenzhaO", host="127.0.0.1", port=3306)
  result <- dbGetQuery(conn,sql)
  dbDisconnect(conn)
  # return the dataframe
  return(result)
}



shinyServer(function(input,output)
{
	sql <- "select DO, longitude,latitude from loggerInfo left join (Select avg(DO) as DO, logger as loggerId from loggerData group by logger) as b on loggerInfo.loggerId=b.loggerId where available=1 and loggerPosition='B'"
	
	filteredData <- reactive({
   		sqlQuery(sql)
 	})
	
	
	geoLocation <- sqlQuery("Select longitude,latitude,loggerId,bathymetry from loggerInfo")

	colorpal <- reactive({
    		colorNumeric(input$colors, filteredData()[,"DO"])
  	})

	output$mymap <- renderLeaflet({
    	leaflet(geoLocation) %>% addTiles() %>% fitBounds(~min(longitude), ~min(latitude), ~max(longitude), ~max(latitude))
    })

	observe({
	    pal <- colorpal()
	    leafletProxy("map", data = filteredData()) %>%
	      clearShapes() %>%
	      addCircles(radius = ~10^DO/10, weight = 1, color = "#777777",
	        fillColor = ~pal(DO), fillOpacity = 0.7, popup = ~paste(DO)
	      )
  	})


	output$timeSeriesPlot <- renderDygraph({
		sql <- "Select Time, DO, logger from loggerData where logger=10528849 or logger=10523447"
		data <- sqlQuery(sql) %>% dcast(Time~logger,value.var="DO")
		data <- zoo(subset(data,select=-Time),order.by=as.POSIXct(data$Time))
		
		dygraph(data, main = "Predicted Deaths/Month") %>% dyRangeSelector()
	})
})