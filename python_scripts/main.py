from bs4 import BeautifulSoup
import json
import collections
import requests
import tempfile
from xml.etree import ElementTree

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
        course_info["long_title"] = course.find("crse_title").text
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
    url = "https://courses.rice.edu/courses/!swkscat.cat?format=XML&p_action=COURSE&p_term="
    courses = requests.get(url + "202010")
    
    with tempfile.TemporaryFile(mode='r+') as fp:
        fp.write(courses.text)
        # wait for write
        fp.flush()
        # reset position to start
        fp.seek(0)


        current_data = {}
        json_data = parse_file(fp, current_data)
        
        # Dump to JSON
        with open("./output.json", "w") as output_file:
            json.dump(json_data, output_file)
            print("finishied writing")

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
