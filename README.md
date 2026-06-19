# 🌱 Gardening Assistant

This application is meant to be an improvement on the Old Famer's Almanac online planting calendar

It was built to solve three main problems.

1. It shows every plant all the time
Instead of sifting through every plant every time you look at the table, I wanted users to be able to make a smaller table based off of just what they have in their personal garden, to see only the information they need at a glance. These smaller tables can also be used to track upcoming planting, as well as best harvest times for previously planted items. 

2. Plants are only sorted alphabetically
For me, the more useful sorting would be by the order in which they are planted throughout the year, so it becomes a sequential checklist. User gardens are sorted by their planting date, and items are highlighted when they are in their optimal planting range.

3. Filtering options in the larger list
I wanted users to be able to use the larger list as a guide for buying seeds. With the option to filter out only what is in season, users can easily get a list of what plants in their area would grow successfully if they planted them that day.

**Live app:** http://54.87.5.45

---

## What it does

- Filters 50+ plants down to what's plantable in your zone right now
- Tracks your personal garden — add plants, see upcoming harvest windows
- Plan your season by date, not alphabetically
- Data sourced via a custom Python scraper and cleaned for zone accuracy

## How it's built

- **Backend:** Node.js, Express, MongoDB
- **Auth:** Passport.js sessions
- **Data pipeline:** Python, BeautifulSoup — scrapes and structures 
  planting date data by USDA zone
- **Frontend:** EJS + vanilla JS
- **Deployed:** AWS EC2

## What's in this repo

- The full Node.js application
- `almanacWebScraper.py` — the Python scraper used to collect and 
  structure planting data from almanac.com
- Design artifacts from the planning phase

---

Built as a capstone project for an MS in Software Development. 
The UX decisions came from being an actual gardener who couldn't 
find a tool that worked the way gardening actually works.
