import urllib.request #library for opening url and creating requests
from pprint import pprint # pretty-print python data structures
import pandas as pd #for converting data in a pandas dataframe
import csv #export data to csv file
import re
from io import StringIO
import json
from datetime import datetime

global spring_table
spring_table = []
global fall_table
fall_table =  []

def main():
    global spring_table
    global fall_table
    global my_garden
    
    #sample zipcode from all planting ranges in CONUS to get full range
    zipcodes = [
        ["2a", 99726, "Bettles, AK"],
        ["2b", 99740, "Fort Yukon, AK"],
        ["3a", 55731, "Ely, MN"],
        ["3b", 56649, "International Falls, MN"],
        ["4a", 55802, "Duluth, MN"],
        ["5a", 53703, "Madison, WI"],
        ["5b", 50309, "Des Moines, IA"],
        ["6a", 62704, "Springfield, IL"],
        ["6b", 64106, "Kansas City, MO"],
        ["7a", 40202, "Louisville, KY"],
        ["7b", 23173, "Richmond, VA"],
        ["8a", 72201, "Little Rock, AR"],
        ["8b", 75201, "Dallas, TX"],
        ["9a", 73301, "Austin, TX"],
        ["9b", 32202, "Jacksonville, FL"],
        ["10a", 32789, "Orlando, FL"],
    ]
    
    output_json = {}
    json_filename = "full_planting_calendar.json"
        
    for zone in zipcodes:
        print(f'Creating planting for zone {zone[0]} with data from {zone[2]}...')
        almanacTables = extract_tables(zone[1])
        
        #almanac website flips which table is shown first, so change this periodically
        #TODO: adjust index assignments based on date
        spring_table = almanacTables[1]
        fall_table = almanacTables[0]


        # Convert and save to file
        plant_array_to_json(spring_table, fall_table, zone[0], output_json)

    print("Tables extracted")
    with open(json_filename, "w") as f:
        json.dump(output_json, f, indent=2)

    print(f'JSON created: ' + json_filename)
            

def get_website_content(zipcode: int):
    url = "https://www.almanac.com/gardening/planting-calendar/zipcode/{}".format(zipcode)
    hdr = {
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.11 (KHTML, like Gecko) Chrome/23.0.1271.64 Safari/537.11',
       'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
       'Accept-Charset': 'ISO-8859-1,utf-8;q=0.7,*;q=0.3',
       'Accept-Encoding': 'none',
       'Accept-Language': 'en-US,en;q=0.8',
       'Connection': 'keep-alive'
       
    }
    print("Attempting to access...")
    req = urllib.request.Request(url=url, headers=hdr)
    try:
        with urllib.request.urlopen(req) as response:
            html = response.read().decode('utf-8')
            return html
    except urllib.error.HTTPError as e:
        print("Encountered error:")
        print(e.code)
        print(e.read())
    

def extract_tables(zipcode):
    xhtml = get_website_content(zipcode)
    xhtml = preprocess_html(xhtml)
    
    start_caption = xhtml.find('<caption>') + len('<caption>')
    end_caption = xhtml.find('</caption>')

    caption_text = xhtml[start_caption:end_caption] if start_caption > -1 and end_caption > -1 else "No caption found"
    #print("Extracting tables for location:", caption_text[caption_text.find("("):])
    
    tables = pd.read_html(StringIO(xhtml))
    
    new_tables = []
    for table in tables:
        table = table.to_numpy()
        new_tables.append(table)
    
    return new_tables

def preprocess_html(input_html):
    #Helps remove extra characters in html table
    # removes line breaks between <td> tags
    input_html = re.sub(r'\s*</td>\s*<td>', '</td><td>', input_html)  
    #puts <td> content on the same line
    input_html = re.sub(r'\s*<td>', '<td>', input_html) 
    input_html = re.sub(r'</td>\s*', '</td>', input_html)
    # replaces breaks with space
    input_html = re.sub(r'<br\s*/?>', ',', input_html)
    
    return input_html

def extract_range(date_str):
    months = {
        'Jan': '01',
        'Feb': '02',
        'Mar': '03', 
        'Apr': '04',
        'May': '05',
        'Jun': '06',
        'Jul': '07',
        'Aug': '08',        
        'Sep': '09',
        'Oct': '10',
        'Nov': '11',
        'Dec': '12'
    }

    if type(date_str) != str:
        return date_str
    else:  
        if "," in date_str:
            ranges = date_str.split(', ')
        else:
            ranges = date_str
        allDates = []

        date_range= ranges[0]
        #appropriately formats the dates for
        if '-' in date_range:
            #sees if date range spans two months, zfill ensures leading zeroes
            if (date_range.split()[1][-1]).isalpha() == True:
                parts = date_range.split('-')
                startMonth = (parts[0].split())[0]
                startDate = (parts[0].split())[1]
                endMonth = (parts[1].split())[0]
                endDate = (parts[1].split())[1]
                allDates = [months[startMonth], startDate.zfill(2), months[endMonth], endDate.zfill(2)]
            else:
                parts = date_range.split()
                month = parts[0]
                days = parts[1].split('-')
                startDate = days[0]
                endDate = days[1]
                allDates = [months[month], startDate.zfill(2), months[month], endDate.zfill(2)]
        else:
            month, day = date_range.split()
            allDates = [months[month], day.zfill(2), months[month], day.zfill(2)]

        startDates = [f"{allDates[0]}-{allDates[1]}"]
        endDates = [f"{allDates[2]}-{allDates[3]}"]

        return (min(startDates), max(endDates))

def plant_array_to_json(spring_table, fall_table, zone_label, output_json):
    output_json[zone_label] = {}

    for row in spring_table:
        name = row[0]
        spring_range = row[3]
        output_json[zone_label][name] = {}
        if type(spring_range) != str:
            #gets the transplant dates if planting seeds outside doesn't exist
            start, end = extract_range(row[2])
        else:
            start, end = extract_range(spring_range)
        if start and end:
            output_json[zone_label][name]["plantOutdoorsStart"] = start
            output_json[zone_label][name]["plantOutdoorsEnd"] = end
        else:
            output_json[zone_label][name]["planyOutdoorsStart"] = spring_range
            
    for row in fall_table:
        name = row[0]
        fall_range = row[1]
        maturity = row[3]
        if name in output_json[zone_label]:
            pass
        else:
            output_json[zone_label][name] = {}
        if type(fall_range) != str:
            pass
        else:
            start, end = extract_range(fall_range)
            if start and end:
                output_json[zone_label][name]["plantOutdoorsStartFall"] = start
                output_json[zone_label][name]["plantOutdoorsEndFall"] = end
            else:
                pass
        output_json[zone_label][name]["maturityTime"] = row[3]


main()

