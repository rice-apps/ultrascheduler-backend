from bs4 import BeautifulSoup
import json
import collections
​
​
def convert_term(number):
    readable = ""
    number = str(number)
    if number[-2:] == "10":
        readable = f"Fall {int(number[:4]) - 1}"
    elif number[-2:] == "20":
        readable = "Spring " + number[:4]
    else:
        readable = "Summer " + number[:4]
    return readable
​
​
def parse_file(file_name, current_data):
    file = open(file_name, "r").read()
    soup = BeautifulSoup(file, "lxml")
    # print(soup)
    # print(soup.find_all("course"))
    for course in soup.find_all("course"):
        course_info = {}
        term = course.find("term")["code"]
        term_readable = convert_term(term)
        # print(term_readable)
        course_info["long_title"] = course.find("crse_title").text
        course_info["crn"] = course.find("crn").text
        course_info["instructors"] = [instructor.text for instructor in course.find_all("name")]
​
        name = course.find("subject")["code"] + " " + course.find("crse_numb").text
​
        if name not in current_data.keys():
            current_data[name] = collections.defaultdict(lambda: [])
​
        current_data[name][term_readable].append(course_info)
​
    return current_data
​
​
def aggregate_parsed_files(file_names):
    parsed_data = {}
    for file_name in file_names:
        parsed_data = parse_file(file_name, parsed_data)
    return json.dumps(parsed_data, indent=4)
​
​
def main():
    json_data = aggregate_parsed_files(["./data/Fall2018.xml", "./data/Fall2019.xml", "./data/Spring2019.xml", "./data/Spring2020.xml"])
    with open("./json/output.json", "w") as output_file:
        output_file.write(json_data)
​
​
if __name__ == '__main__':
    main()