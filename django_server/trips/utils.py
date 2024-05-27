# Path: trips/utils.py
import requests
import urllib.parse
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.action_chains import ActionChains
from bs4 import BeautifulSoup
import time
import json
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

def generate_directions_url(origin, destination):
    base_url = "https://www.google.com/maps/dir/?api=1"
    encoded_origin = urllib.parse.quote(str(origin))
    encoded_destination = urllib.parse.quote(str(destination))
    directions_url = f"{base_url}&origin={encoded_origin}&destination={encoded_destination}&travelmode=transit"

    return directions_url

def scrape_transit_info(origin, destination, departure_time, max_retries=3):
    url = generate_directions_url(origin, destination)
    transit_stops = []
    stop_times = []
    retry_count = 0
    driver = None

    while retry_count < max_retries:
        try:
            # Configure Chrome options
            chrome_options = Options()
            chrome_options.add_argument("--headless")
            chrome_options.add_argument("--no-sandbox")
            chrome_options.add_argument("--disable-dev-shm-usage")
            # logger.error("PRIOR TO DRIVER")
            # Setup WebDriver using WebDriver Manager
            driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=chrome_options)
            driver.get(url)
            # logger.error("AFTER DRIVER")
            # Click on the "Leave now" button to open the dropdown menu
            leave_now_button = WebDriverWait(driver, 10).until(
                EC.element_to_be_clickable((By.XPATH, '//div[@class="goog-inline-block goog-menu-button-outer-box"]'))
            )
            leave_now_button.click()
            # logger.error("AFTER LEAVE NOW")
            # Select the "Depart at" option
            depart_at_option = WebDriverWait(driver, 10).until(
                EC.element_to_be_clickable((By.XPATH, '//div[@class="goog-menuitem" and @role="option" and @id=":1"]'))
            )
            depart_at_option.click()
            # logger.error("AFTER DEPART AT")
            # Convert the departure time to the desired format
            departure_time_obj = datetime.fromtimestamp(departure_time)
            desired_time = departure_time_obj.strftime("%I:%M %p")
            # logger.error("AFTER DESIRED TIME")
            # Find the closest half-hour time
            time_input = WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.XPATH, '//input[@class="LgGJQc"]'))
            )
            time_input.clear()
            time_input.send_keys(desired_time)
            
            # logger.error("AFTER TIME INPUT")
            transit_details_button = WebDriverWait(driver, 2).until(
                EC.element_to_be_clickable((By.XPATH, '//button[@class="TIQqpf fontTitleSmall XbJon Hk4XGb"]'))
            )
            transit_details_button.click()
            
            # logger.error("Transit Details")
            transit_groups = driver.find_elements(By.XPATH, '//span[contains(@class, "CmO0Ef") and contains(@class, "W5NUd") and @class="FueNo closed"]')
            for group in transit_groups:
                group_id = group.get_attribute('data-groupindex')
                hideable_id = group.get_attribute('data-hideableid')

                WebDriverWait(driver, 2).until(EC.element_to_be_clickable((By.ID, hideable_id))).click()
            # logger.error("PRIOR TO SOUP")
            soup = BeautifulSoup(driver.page_source, 'html.parser')
            stops = soup.select('.xcyl6 .transit-logical-step-content .Ii0Kpe .hideable .vj6Hgd')
            # logger.error("AFTER SOUP")
            
            if stops:
                for stop in stops:
                    # logger.error("STOP")    
                    stop_name = stop.select_one('.qjQGPd').text.strip()
                    stop_time = stop.select_one('.SLmIwe').text.strip()
                    transit_stops.append(stop_name)
                    stop_times.append([stop_time, stop_name])
                    # logger.error("STOP NAME AND STOP TIME APPENDED" + stop_name + stop_time)
                driver.quit()
                
                break  

        except Exception as e:
            retry_count += 1
            time.sleep(5)
        finally:
            if driver is not None:
                driver.quit()
                
    logger.error("----------")
    logger.error(transit_stops)
    logger.error("----------")
    logger.error(stop_times)
    logger.error("----------")

    return transit_stops, stop_times

def get_commute_info(origin, destination, departure_time, type, mode='transit'):
    API_KEY = 'AIzaSyBb2fVcyg2aCfvejujrwGrHte4upg_tF1c'
    fields = 'routes.legs.steps.transitDetails.num_stops,routes.legs.steps.transitDetails.line_name,routes.legs.steps.transitDetails.departure_stop.name,routes.legs.steps.transitDetails.arrival_stop.name,routes.legs.steps.startLocation,routes.legs.steps.endLocation,routes.legs.steps.polyline,routes.legs.steps.travelMode,routes.legs.steps.transitDetails.stops.name'
    url = f'https://maps.googleapis.com/maps/api/directions/json?origin={origin}&destination={destination}&mode={mode}&key={API_KEY}&fields={fields}'

    if departure_time:
        url += f'&departure_time={departure_time}'

    if type == 'train':
        allowed_travel_modes = ["SUBWAY", "TRAIN", "LIGHT_RAIL", "RAIL"]
        transit_preferences = {"allowedTravelModes": allowed_travel_modes}
        url += f'&transitPreferences={json.dumps(transit_preferences)}'
    elif type == 'bus':
        allowed_travel_modes = ["BUS"]
        transit_preferences = {"allowedTravelModes": allowed_travel_modes}
        url += f'&transitPreferences={json.dumps(transit_preferences)}'
    
    response = requests.get(url)
    
    commute_info = {}
    commute_info['segments'] = []
    
    if response.status_code == 200:
        data = response.json()
        
        routes = data['routes']
        if routes:
            route = routes[0] 
            legs = route['legs']
            
            for leg in legs:
                steps = leg['steps']
                for step in steps:
                    travel_mode = step['travel_mode']
                    if travel_mode == 'TRANSIT':
                        transit_details = step['transit_details']
                        line_name = transit_details.get('line', {}).get('name', 'Unknown line')
                        departure_stop = transit_details.get('departure_stop', {}).get('name', 'Unknown departure stop')
                        arrival_stop = transit_details.get('arrival_stop', {}).get('name', 'Unknown arrival stop')
                        num_stops = transit_details.get('num_stops', 0)
                        
                        segment = {
                            'line_name': line_name,
                            'departure_stop': departure_stop,
                            'arrival_stop': arrival_stop,
                            'num_stops': num_stops
                        }
                        commute_info['segments'].append(segment)
        
        else:
            print('No routes found.')
    
    else:
        print('Error occurred while fetching route information.')
        
    logger.error(commute_info)
    
    transit_stops, stop_times = scrape_transit_info(origin, destination, departure_time)
    commute_info['transit_stops'] = transit_stops
    commute_info['stop_times'] = stop_times
    
    return commute_info

def convert_to_epoch_time(date_time_str):
    date_time_obj = datetime.fromisoformat(date_time_str.replace('Z', '+00:00'))
    return int(date_time_obj.timestamp())


def get_commute_route(origin, destination, mode, start_time=None):
    if mode == "plane":
        return ["Plane - No Route"]
    departure_time = convert_to_epoch_time(start_time) if start_time else None
    info = get_commute_info(origin, destination, departure_time, mode)
    return info


def info_formatter(info):
    formatted_info = {'segments': info['segments'], 'formatted': []}
    
    formatted_segments = {}
    previous_stop = None
    previous_time = None
    
    for time, stop in info['stop_times']:
        if previous_stop is not None:
            key = f"{previous_stop}-{stop}"
            formatted_segments[key] = [previous_stop, stop, previous_time]
        
        previous_stop = stop
        previous_time = time

    formatted_info['formatted'].append(formatted_segments)

    return formatted_info