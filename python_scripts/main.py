from bs4 import BeautifulSoup
import json
import collections
import requests
import tempfile
from xml.etree import ElementTree
import re

def check_days(course):
    day_tags = ["mon_day", "tue_day", "wed_day", "thu_day", "fri_day", "sat_day", "sun_day"]
    days = []
    for day_tag in day_tags:
        day_node = course.find(day_tag)
        if (day_node):
            days.append(day_node.text)
    return days

def convert_term(number):
    readable = ""
    number = str(number)
    if number[-2:] == "10":
        readable = "Fall " + str(int(number[:4]) - 1)
    elif number[-2:] == "20":
        readable = "Spring " + number[:4]
    else:
        readable = "Summer " + number[:4]
    return readable


def parse_file(file, current_data):
    # file = open(filename, "r").read()
    soup = BeautifulSoup(file.read(), "lxml")
    # print(soup)
    # print(soup.find_all("course"))
    for course in soup.find_all("course"):
        course_info = {}
        # Sometimes this breaks and we just want to skip those
        if (course.find("term") == None):
            continue
        term = course.find("term")["code"]
        term_readable = convert_term(term)
        # print(term_readable)
        # print(course)
        # Get long title
        course_info["long_title"] = course.find("crse_title").text
        # Testing
        times_node = course.find("times")
        # Iterate through times node for meeting times
        class_time_set = False
        class_days = []
        lab_time_set = False
        lab_days = []
        if (times_node):
            for meeting_node in times_node.findChildren():
                # Check that this isn't final exam
                type_node = meeting_node.find("type")
                sched_node = meeting_node.find("sched")
                if (type_node and type_node.get("code") == "CLAS"):
                    if (not class_time_set):
                        course_info["class_start_time"] = meeting_node.get("begin-time")
                        course_info["class_end_time"] = meeting_node.get("end-time")
                        # Set days
                        day_nodes = meeting_node.find_all(re.compile("_day")) # Get all day nodes
                        for day_node in day_nodes:
                            class_days.append(day_node.text)
                        course_info["class_days"] = class_days
                        class_time_set = True
                    else:
                        # Class time already set, this must be the lab
                        course_info["lab_start_time"] = meeting_node.get("begin-time")
                        course_info["lab_end_time"] = meeting_node.get("end-time")
                        # Set days
                        day_nodes = meeting_node.find_all(re.compile("_day")) # Get all day nodes
                        for day_node in day_nodes:
                            lab_days.append(day_node.text)
                        course_info["lab_days"] = lab_days
                        lab_time_set = True
        course_info["crn"] = course.find("crn").text
        course_info["instructors"] = [instructor.text for instructor in course.find_all("name")]

        name = course.find("subject")["code"] + " " + course.find("crse_numb").text

        if name not in current_data.keys():
            current_data[name] = collections.defaultdict(lambda: [])

        current_data[name][term_readable].append(course_info)

    return current_data


def aggregate_parsed_files(file_names):
    parsed_data = {}
    for file_name in file_names:
        parsed_data = parse_file(file_name, parsed_data)
    return json.dumps(parsed_data, indent=4)


def main():
    print("start")
    terms = ["201810", "201820", "201910", "201920", "202010", "202020", "202110"]
    url = "https://courses.rice.edu/courses/!swkscat.cat?format=XML&p_action=COURSE&p_term="
    # Initialize file
    with open("./output5.json", "w+") as output_file:
        output_file.write("[")

    for term in terms:
        print(term)
        term_url = url + term
        courses = requests.get(term_url)
        print("Made request")
        with tempfile.TemporaryFile(mode='r+') as fp:
            print("Writing to tempfile")
            fp.write(courses.text)
            # wait for write
            fp.flush()
            # reset position to start
            fp.seek(0)

            print("Finishing writing to tempfile")

            current_data = {}
            json_data = parse_file(fp, current_data)
            
            # Dump to JSON
            with open("./output5.json", "a+") as output_file:
                json.dump(json_data, output_file)
                output_file.write(",\n")
                print("finishied writing this term")
    
    with open("./output5.json", "a+") as output_file:
        output_file.write("]")

    # XML is destroyed


    # with open("courses.xml", 'w') as file:
    #     file.write(courses.text)
    
    # Use temporary file to create JSON file
    # current_data = {}
    # json_data = parse_file(temp.name, current_data)

    # Remove temp XML file
    # temp.close()

    # json_data = aggregate_parsed_files(["./data/Fall2018.xml", "./data/Fall2019.xml", "./data/Spring2019.xml", "./data/Spring2020.xml"])
    



if __name__ == '__main__':
    main()
