package main

import (
	"encoding/json"
	"fmt"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/gocolly/colly/v2"
	"github.com/gocolly/colly/v2/debug"
)

type Event struct {
	Id          int    `json:"id"`
	Title       string `json:"title"`
	Image       string `json:"image"`
	Description string `json:"description"`
	Start       string `json:"start"`
	End         string `json:"end"`
	Genre       string `json:"genre"`
	Location    string `json:"location"`
	Status      string `json:"status"`
}

type Genre struct {
	Name string `json:"name"`
}

type Data struct {
	Events []Event  `json:"events"`
	Stages []string `json:"stages"`
	Genres []Genre  `json:"genres"`
}

func main() {
	allKeys := make(map[int]bool)
	stageKeys := make(map[string]bool)
	genreKeys := make(map[string]bool)
	events := []Event{}
	stages := []string{}
	genres := []Genre{}

	c := colly.NewCollector(colly.Debugger(&debug.LogDebugger{}))

	c.OnHTML("div.sgf-events", func(ge *colly.HTMLElement) {
		date := strings.Split(ge.Attr("date"), "-")
		day, _ := strconv.Atoi(date[0])
		month, _ := strconv.Atoi(date[1])
		year_string, _ := ge.DOM.Find(".evo-data").Attr("data-cyear")
		year, _ := strconv.Atoi(year_string)

		ge.ForEach("div.event", func(_ int, e *colly.HTMLElement) {
			startRaw, _ := time.Parse("2006-1-02T15-04", e.ChildAttr("meta[itemprop=\"startDate\"]", "content"))
			endRaw, _ := time.Parse("2006-1-02T15-04", e.ChildAttr("meta[itemprop=\"endDate\"]", "content"))
			id, _ := strconv.Atoi(e.Attr("data-event_id"))
			location := e.ChildText("span.evcal_desc.evo_info.hide_eventtopdata > span.evcal_desc_info > em > em")
			genre := e.ChildText("span.evcal_desc.evo_info.hide_eventtopdata > span.evcal_desc3 > span.evcal_event_types.ett1 > em:nth-child(2)")

			fmt.Println("id: ", id)

			if _, v := stageKeys[location]; !v {
				stageKeys[location] = true
				stages = append(stages, location)
			}

			if _, v := genreKeys[genre]; !v {
				genreKeys[genre] = true
				genres = append(genres, Genre{Name: genre})
			}

			dayAdd := 0

			if startRaw.Hour() < 12 {
				dayAdd = 1
			}

			startCorrected := time.Date(year, time.Month(month), day+dayAdd, startRaw.Hour(), startRaw.Minute(), 0, 0, time.Local)
			endCorrected := time.Date(year, time.Month(month), day+dayAdd, endRaw.Hour(), endRaw.Minute(), 0, 0, time.Local)

			eventNew := Event{
				Id:          id,
				Title:       e.ChildText("span.evcal_event_title"),
				Image:       e.ChildAttr("meta[itemprop=\"image\"]", "content"),
				Description: e.ChildAttr("meta[itemprop=\"description\"]", "content"),
				Start:       startCorrected.Format("2006-01-02T15:04:05") + "+02:00",
				End:         endCorrected.Format("2006-01-02T15:04:05") + "+02:00",
				Genre:       genre,
				Location:    e.ChildText("span.evcal_desc.evo_info.hide_eventtopdata > span.evcal_desc_info > em > em"),
				Status:      e.ChildAttr("meta[itemprop=\"eventStatus\"]", "content"),
			}

			if _, v := allKeys[id]; !v {
				allKeys[id] = true
				events = append(events, eventNew)
			}
		})
	})

	// Before making a request print "Visiting ..."
	c.OnRequest(func(r *colly.Request) {
		fmt.Println("Visiting", r.URL.String())
	})

	c.Visit("https://www.schlossgrabenfest.de/programm/")

	result := Data{
		Events: events,
		Stages: stages,
		Genres: genres,
	}

	val, _ := json.Marshal(result)

	fmt.Printf("%v", result)

	f, _ := os.Create("upload/events.json")

	f.Write(val)

	f.Close()
}
