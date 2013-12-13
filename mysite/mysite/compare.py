import json
import pandokia.helpers.filecomp as filecomp
import itertools
#Search for items deleted in one, so that we can delete them from another
def search(searchThis, searchIn):
	found = False
	print "search " + searchThis['title']
	for s in searchIn:
		if (s['title'] == searchThis['title']):
			print "Found "+searchThis['title']
			found = True
			#return found
			break
			
			
		else:
			found = False
			print "Not Found " + searchThis['title']
		if s['ifFolder']:
			search(searchThis,s['children'])		
	return found
			

		

def compare(searchThis, searchIn, found):
	#if found != True:
	#	print "Found not True"
	#print " Here I return " + searchThis.title
	#print searchThis.title + " " + str(found)
	#print "returned here " + str(found)
	if (found == True):
		#print "It's true"
		return True
		#pass
	else:
		found = False
	for s in searchIn:
		if (searchThis.itemId == s['itemId']):
			found = True
			#print  s['title'] + " found " + str(s['itemId'])
			try:
				if (searchThis.url == s['url']):
					pass
					#found = True
					#return found
					#print searchThis.url + " has not changed it's title"
				else:
					print searchThis.url + " has changed it's url"
					#found = False
				
			except KeyError:
				#print searchThis.title + " was found!"
				found = True
			#print "return"
			return found
		elif (s['ifFolder']):
			found = compare(searchThis,s['children'], found)
			#print "return here after child " + str(found)
		else:
			found = False
	#print str(found)
	return found

	#return found
	
			
			
	
	
