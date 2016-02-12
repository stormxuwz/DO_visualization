library(shiny)
library(dygraphs)
library(leaflet)


shinyUI(
  fluidPage(
  		fluidRow(
  			column(
  				3,
  				# h4("This is a test to control time and variable"),
  				radioButtons("radio", 
  						label = h4("Choose Data Year"),
       					choices = list("2014" = 2014, "2015"=2015),
       					selected=2014
       			)
  			),

  			column(
  				3,
  				selectInput("var", 
  						label = h4("Variable to display"), 
        				choices = list("Temperature" = "temp", "Dissolved Oxygen" = "DO"), 
        				selected = "temp")
  			),
  			column(
  				3,
  				textInput("fromDatetime", "From:", value = "9999-99-99 99:99:99")
  			),

  			column(
  				3,
  				selectInput("colors", "Color Scheme",
      			rownames(subset(brewer.pal.info, category %in% c("seq", "div"))))
      		)
  		),

  		hr(),

  		fluidRow(
  			column(
  				6,
  				leafletOutput("mymap")
  				
  			),
  			column(
  				6,
  				dygraphOutput('timeSeriesPlot')
  			)

  		)
  
	)
)