from collections import defaultdict

# Data tasks
tasks = [
    {"id": "A1", "s": 1, "e": 4, "allocation": 1.0},
    {"id": "A2", "s": 2, "e": 4, "allocation": 0.5},
    {"id": "B",  "s": 3, "e": 5, "allocation": 0.5},
    {"id": "A3", "s": 4, "e": 6, "allocation": 0.5},
    {"id": "C1", "s": 2, "e": 4, "allocation": 0.5},
    {"id": "C2", "s": 1, "e": 3, "allocation": 0.5},
]

# Step 1: buat dictionary per hari dengan daftar task
schedule = defaultdict(list)
for t in tasks:
    for day in range(t["s"], t["e"] + 1):
        schedule[day].append(t)

# Step 2: alokasikan orang per hari, satu task = satu orang
people_allocation = defaultdict(list)  # key = person, value = list of (day, task)
next_person_id = 1
people_load = defaultdict(float)  # track load per person per day

for day in sorted(schedule.keys()):
    for task in schedule[day]:
        assigned = False
        # coba assign ke orang existing
        for person in range(1, next_person_id):
            if people_load[(person, day)] + task["allocation"] <= 1.0:
                people_allocation[person].append((day, task["id"], task["allocation"]))
                people_load[(person, day)] += task["allocation"]
                assigned = True
                break
        # kalau tidak ada yang bisa, buat orang baru
        if not assigned:
            person = next_person_id
            next_person_id += 1
            people_allocation[person].append((day, task["id"], task["allocation"]))
            people_load[(person, day)] = task["allocation"]

# Step 3: tampilkan hasil
for person, task_list in people_allocation.items():
    print(f"Person {person}:")
    for day, task_id, load in task_list:
        print(f"  Day {day}: Task {task_id}, Load {load}")
    print()
