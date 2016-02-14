?library(shiny)
library(dygraphs)
library(leaflet)
library(RColorBrewer)


shinyUI(
  fluidPage(
  		fluidRow(
  			column(
  				3,
  				# h4("This is a test to control time and variable"),
  				selectInput("year", 
  						label = h5("Year"),
       					choices = list("2014" = 2014, "2015"=2015),
       					selected=2014)
  			),

  			column(
  				3,
  				selectInput("var", 
  						label = h5("Variable"), 
        				choices = list("Temperature" = "Temp", "Dissolved Oxygen" = "DO"), 
        				selected = "Temp")
  			),
  			column(
  				3,
  				dateInput("myDate", 
  					label = h5("Date"), 
  					value = "2014-08-01")
  			)
  		),

  		fluidRow(
  			column(
  				3,
  				selectInput("dataType", 
  						label = h5("Aggregrate Type"),
       					choices = list("Standard Dev" = "STD", "Average"="AVG","RAW"="Raw"),
       					selected="AVG")
  			),

  			column(
  				3,
  				selectInput("GroupRange", 
  						label = h5("Aggregrate Range"),
       					choices = list("Daily" = "daily", "Hourly"="hourly"),
       					selected="daily")
  			),

  			column(
  				3,
  				sliderInput("myHour", 
  					label = h5("Hour"), 
  					min = 0, max = 23,value=12)
  			),
			column(
  				2,
  				selectInput("colors", h5("Color Scheme"),
      			rownames(subset(brewer.pal.info, category %in% c("seq", "div"))))
      		)
  		),

  		hr(),
  		
  		fluidRow(
  			column(
  				5,
  				leafletOutput("mymap")
  			),
  			column(
  				7,
  				dygraphOutput('timeSeriesPlot')
  			)
  		),


  		fluidRow(
  			column(3,
	  			selectizeInput("selectedID", label=h5("Selected Loggers"), 
	  				choices=NULL, 
	  				selected = NULL, 
	  				multiple = TRUE,
	                options = NULL)
	  		),
	  		column(
  				3
	  		)

  		)
	)
)