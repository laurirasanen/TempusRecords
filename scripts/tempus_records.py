import shutil
import os
import sys
from resolution import ScreenRes

tf_path = "C:/Program Files (x86)/Steam/steamapps/common/Team Fortress 2/tf"
recording_cfg_path = "./configs/tempusrecords"
default_cfg_path = "./configs/default"
tempusrecords_path = "../TempusRecords"

def remove():
	# remove old files
	try:
		shutil.rmtree(tf_path + "/custom")
	except FileNotFoundError as e:
		pass	

	try:
		shutil.rmtree(tf_path + "/cfg")
	except FileNotFoundError as e:
		pass

if __name__ == "__main__":
	if len(sys.argv) > 1 and sys.argv[1] == "default":
		# reset to default
		ScreenRes.set(1920, 1080, 32, 240)
		remove()
		shutil.copytree(default_cfg_path + "/custom", tf_path + "/custom")
		shutil.copytree(default_cfg_path + "/cfg", tf_path + "/cfg")
		exit()

	else:
		# check addons folder
		assert(os.path.isdir(tf_path + "/addons"))

		# copy recording cfg
		ScreenRes.set(2560, 1440, 32, 240)
		remove()
		shutil.copytree(recording_cfg_path + "/custom", tf_path + "/custom")
		shutil.copytree(recording_cfg_path + "/cfg", tf_path + "/cfg")

	# start tempusrecords
	os.chdir(tempusrecords_path)
	if len(sys.argv) > 1:
		os.system("node ./TempusRecords.js " + " ".join(sys.argv[1:]))
	else:
		os.system("node ./TempusRecords.js")