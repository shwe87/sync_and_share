from django.shortcuts import render
from django import template
from django.template.loader import get_template
from django.template import Context
from django.http import HttpResponse, HttpResponseNotFound, HttpResponseBadRequest, HttpResponseNotAllowed
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
#from syncShare.models import UsersData
from syncShare.models import Sync
from syncShare.models import Share
from syncShare.models import MyGroup
from syncShare.models import UserGroup
from syncShare.models import Bookmark
from django.core.exceptions import ValidationError
from syncShare.models import validate_type
import json
from django.contrib.auth.models import User
#from django.contrib.auth.models import Group
from forms import ShareForm
import uuid
import datetime
#from friends.views import friendship_request
#from friends.views import friendship_accept
#from friends.models import FriendshipRequest




# @function parseData: Given a query_set (from Sync model), parse it to a list of dict objects.
# @param datasList {query_set}: contains a list of query_set objects of type Sync.
# @return thisList {list}: A list of the parsed query_set to dict object.
def parseData(datasList):
	thisList = []
	for d in datasList:
		thisDict = {}
		try:
			thisDict['title'] = d.title
		except KeyError:
			pass
		thisDict['url'] = d.url
		thisDict['typeOf'] = d.typeOf
		thisDict['user'] = d.user
		thisList.append(thisDict)
		#thisList['id'] = t.tabID
	return thisList


# @function main: This renders the Log in/ Log out page.
# @param request {request object}: The incoming request.
# @return a rendered template.
def main(request):
	return render(request, 'login.html')


def saveData(aData):
	#givenData = aData['data']
	title = aData['title']
	url = aData['url']
	typeOf = aData['typeOf']
	user = aData['user']
	#create = aData['create']
	datas = {}
	try:	#See if this data was already saved
		#savedData = Sync.objects.filter(user=user,typeOf=typeOf,url=url)#.filter(typeOf=typeOf).filter(url=url)
		savedData = Sync.objects.get(user=user,typeOf=typeOf,url=url)
		print(savedData.title)
		print(savedData.url)
		print(savedData.typeOf)
		datas['exists'] = True
		datas['savedData'] = savedData
		#savedType = savedData.objects.filter(typeOf=typeOf)
		"""if (len(savedType) > 0):
			savedUrl = savedType.objects.filter(url=url)
			if (len(savedUrl) > 0):
				datas['exists'] = True
				datas['savedData'] = savedUrl
			else:
				savedData = Sync(user=user,title=title,url=url,typeOf=typeOf)
				datas['savedData'] = savedData
		else:
			datas['exists'] = False
		#datas['exists'] = True"""	
	except Sync.DoesNotExist:
		print('No exist')
		datas['exists'] = False
		savedData = Sync(user=user,title=title,url=url,typeOf=typeOf,unique=str(uuid.uuid4()))
		savedData.save()
		print (savedData.id)
		datas['savedData'] = savedData
	return datas

"""def saveShareData(aData):
	#givenData = aData['data']
	title = aData['title']
	url = aData['url']
	typeOf = aData['typeOf']
	share_from = aData['share_from']
	share_with = aData['share_with']
	#create = aData['create']
	datas = {}
	datas['ifError'] = False
	try:
		savedData = Sync.objects.get(user=share_from,url=url,typeOf=typeOf)
		try:
			#CHeck the user to share with!!!!!!!!!!!!!!!!!!!!!!!!!!!
			
			sharedData = Share.objects.get(shared=savedData,shared_with=share_with)
			datas['error_type'] = 'share_exists'
			datas['error'] = 'Data already shared with ' + share_with
			datas['ifError'] = True
			datas['sharedData'] = sharedData
		except Share.DoesNotExist:
			try:
				sharedData = Share(shared=savedData,share_with=share_with)
				sharedData.save()
				datas['sharedData'] = sharedData	
			except ValidationError:
				datas['ifError'] = True
				datas['error_type'] = 'share_with_error'
				datas['error'] = 'Cannot share with ' + share_with +'. No such user.'	
	except Sync.DoesNotExist:
		datas['ifError'] = True
		datas['error_type'] = 'no_such_sync'
		datas['error'] = 'Such data does not exist'
	return datas
		
"""	

@login_required()
def welcome(request):
    	#html = "<html><body>Welcome to  Sync & Share %s </body></html>" %request.user.email 
    	#return HttpResponse(html)
    	"""t = get_template('welcome.html')
    html = t.render(Context({'current_date': now}))
    	response = HttpResponse()
    	t = get_template('welcome.html')
    	#t = template.Template("welcome.html")
	c = t.render(Context({'email':request.user.email}))
	#t.render(c)
	response.write(c)"""
	print request.user.email
	emails = []
	emails.append('shweta87.work@gmail.com')
	emails.append('parihu@gmail.com')
	emails.append('parihu@gmail.com')
	emails = sorted(set(emails))
	print "EMAILS"
	"""thisUser = User.objects.get(email=request.user.email)
	shared = Share.objects.filter(shared_from=thisUser)
	if shared:
		print ("SI")
		for s in shared:
			s.shared_with_emails.remove("asdfkdskf")
	"""	
	try:
		toRemove = str(request.user.email)
		emails.remove(toRemove)
		
	except ValueError:
		pass
	print emails
	return render(request, 'welcome.html',{'email':request.user.email})


def hello():
	print("hello")
	
@csrf_exempt    	
#Without csrf_exempt the response sent to the add-on wasn't the desired one by us.
def save(request, element):
	response = HttpResponse()
	print (element)
	print (request.body)
	#print (request.META)
	if (request.user.is_authenticated()):
		try:
			#Validate the element passed: Valid only tabs,bookmarks or history.
			validate_type(element)
			parsedData = json.loads(request.body)	#parse the incoming data to json type.
			alreadyExists = []
			for p in parsedData:
				p['user'] = request.user
				p['typeOf'] = element
				savedData = saveData(p)
				if (savedData['exists'] == True):
					alreadyExists.append(savedData['savedData'])
			if (len(alreadyExists) > 0):
				response['error'] = 'already_exists'
				response.content = json.dumps(parseData(alreadyExists))	
				response.content_type = 'application/json'
		except ValidationError:
			response = HttpResponseBadRequest()
			response['error'] = 'Bad Request'
			response.content = 'Bad Request. Only allowed: /save/tabs/ or /save/bookmarks or /save/history'	
	else:
		response.status_code = 401
		response['error'] = 'Unauthorized'
		response.content = 'Unauthorized'
	return response

#dumped = json.dumps(parseTab(usersTabs))
#response = HttpResponse(dumped, content_type="application/json")

@csrf_exempt    	
#Without csrf_exempt the response sent to the add-on wasn't the desired one by us.
def read(request, element):
	response = HttpResponse()
	#thisUser = User.objects.get(username='shweta')
	if (request.user.is_authenticated()):
		#Get the table's entry:
		try:
			validate_type(element)
			user = request.user
			try:
				readData = Sync.objects.filter(user=user,typeOf=element)
				print (len(readData))
				if (len(readData) > 0):
					dumped = json.dumps(parseData(readData))
					response = HttpResponse(dumped, content_type="application/json")
				else:
					response = HttpResponseNotFound()
					response['error'] = 'error_nothing_saved'
					response['error_nothing_saved'] = 'No ' + str(element)+' saved'
					response.content = 'No ' + str(element)+' saved yet for this user.'			
			except Sync.DoesNotExist:
				print ("Dosn't exist")					
		except ValidationError:
			response = HttpResponseBadRequest()
			response['error'] = 'Bad Request'
			response.content = 'Bad Request. Only allowed: /read/tabs/ or /read/bookmarks or /read/history'
	else:
		response.status_code= 401
		response['error'] = 'Unauthorized'
		response.content = 'Unauthorized'
	return response


def save_group(user, groupName, members ):
	try:
		ug = UserGroup.objects.get(user=user)	#This has to be unique.
		print ug.groups.all()			#All the groups that the user is in
	except UserGroup.DoesNotExist:
		#No groups associated with the user.			
		ug = UserGroup(user=user)		#Create one
		ug.save()				#Save it.
	uid = uuid.uuid4()
	uid = str(uid)
	mg = MyGroup(creator=user, groupName=groupName,unique=uid)
	mg.save()
	for m in members:	#Add the members of this group
		u = User.objects.get(email=m)
		mg.members.add(u)
		# For each member add them as the part of the group in ther user's group table.
		try:# Has to be symmetrical
			memgr = UserGroup.objects.get(user=u)
			memgr.groups.add(mg)
		except UserGroup.DoesNotExist:
			memgr = UserGroup(user=u)
			memgr.save()
			memgr.groups.add(mg)
	ug.groups.add(mg)
	return mg	#Return the saved group

@csrf_exempt
def deleteSync(request):
	print request.user
	print request.body
	print request.POST
	if request.method == 'POST':
		uniqueId = request.POST['unique']
		print uniqueId
		try:
			s = Sync.objects.get(unique=uniqueId)
			s.delete()
			response = HttpResponse()
			response.write("OK");
		except Sync.DoesNotExist:
			response = HttpResponseNotFound()
			response.write("Not Found");
	else:
		response = HttpResponseNotAllowed("Only POST Allowed")
	return response	

@csrf_exempt
def deleteShareFromContent(request):
	print request.user
	print request.body
	print request.POST
	if request.method == 'POST':
		#typeOf = request.POST['typeOf']
		shareId = request.POST['shareId']
		toDeleteId = request.POST['toDeleteId']
		#uniqueId = request.POST['unique']
		#print uniqueId
		
		#Delete an item that the user was sharing with other users.
		try:
			shared_content = Share.objects.get(unique=shareId)
			shared_from = shared_content.shared_from
			if (shared_from.email == request.user.email):	#If the user is the owner
				sync = Sync.objects.get(unique=toDeleteId)
				print "sync deleted"
				shared_content.shared.remove(sync)
				t = shared_content.shared.all()
				print "Length of shared.all()"
				print len(t)
				if (len(t) is 0):
					print "deleted"
					#If it is 0, it means, there is nothing to share:
					shared_content.delete()
				#for h in t:
				#	print h.title
				print "sync deleted 2"
				response = HttpResponse()
				response.write("OK")
			else:
				response = HttpResponseNotAllowed('You are not the owner')						
		except Share.DoesNotExist:
			response = HttpResponseNotFound()
			response.write("Not Found")			
	else:
		response = HttpResponseNotAllowed("Only POST allowed")
	
	#response= HttpResponse()
	return response
	


# @function share: This function is called when the url is /share/. It displays a form so that the user can
#		   choose what to share, with whom to share, what to do with the synced elements, etc.
# @param request {Request object}: contains the request object.
# @return a rendered template depending on:
#	-- if the user has nothing synced yet then the noShare.html template will be rendered.
#	-- if the user has something synced then the share.html template will be rendered.	
@csrf_exempt
def share(request):
	response = HttpResponse()
	try:
		#first of all, try to fetch the user's synced elements.
		synced = Sync.objects.filter(user=request.user)
		if not synced:					#If it doesn't filter anything
			synced = None
	except Sync.DoesNotExist:				#If this user hasn't synced anything yet.
		synced = None
	try:
		#Now just try to see if this user belongs to any group.
		ug = UserGroup.objects.get(user=request.user)	
		groups = ug.groups.all()			#ManyToManyField groups.
		#print groups
		for g in groups:				#Iterate every group
			#sharedObjects = g.share_set.all()	#See what this group has shared.
			#print sharedObjects			
			title = ""
			thisGroupsMembers = g.members.all()
			for m in thisGroupsMembers:
				title = title + m.email + "\r\n"
			#print title
	except UserGroup.DoesNotExist:				#If this user hasn't created any group yet
		groups = None
	if (request.method == 'POST'):				#User has sent the form
		form = ShareForm(request.POST, request=request)	#The request object is passed to validate the form
		if form.is_valid():				#If the form is valid or not
			cd = form.cleaned_data			#Cleaned data
			print cd
			toShare = cd['toShare']			#These are the objects that are going to be shared 
			uid = uuid.uuid4()
			uid = str(uid)
			saveShared = Share(shared_from=request.user,unique=uid)#Create a new entry for the share
			saveShared.save()
			for checked in toShare:			#Save all the checked objects
				print checked
				shared = Sync.objects.get(unique=checked)	#Get it from the synced object and add it
				#check_if_exist(shared,request.user)
				saveShared.shared.add(shared)
			selectFrom = cd['selectFrom']		#What type of sharing with was selected
			if (selectFrom == '1'):		
				#Share by email address:
				byEmail = cd['friends_email']	#Friends email
				saveShared.typeOf_share = 'email'#Share is by email
				saveShared.save()		
				for u in byEmail:		#Add all those with whom to share
					shareWithUser = User.objects.get(email=u)
					saveShared.shared_with_emails.add(shareWithUser)
			elif (selectFrom == '2'):		
				#Create a group and share:
				byEmail = cd['friends_email']
				group_name = cd['group_name']	
				saveShared.typeOf_share = 'group'
				saveShared.save()
				#Create the group:
				savedGroup = save_group(request.user,group_name,byEmail)	#create the group with the povided friends email addresses
				saveShared.shared_with_group.add(savedGroup)				
			elif (selectFrom == '3'):
				#Share with existing group:
				existingGroups = cd['existingGroups']
				saveShared.typeOf_share = 'group'
				saveShared.save()
				for checked in existingGroups:
					savedGroup = MyGroup.objects.get(unique=checked)
					saveShared.shared_with_group.add(savedGroup)	
			response.write("OK")
			return response
	else:
		# What has this user shared:
		#thisShare = Share.objects.filter(shared_from=request.user)
		form = ShareForm()
		for field in form:
			if (field.name == 'toShare'):
				try:
					if not (synced == None):
						for s in synced:
							aux = (s.unique,s.title)
							field.field.widget.choices.append(aux)
						#print field.field.widget.choices
				except AttributeError:
					pass
			elif (field.name == 'existingGroups'):
				try:
					if not (groups == None):
						for e in groups:
							aux = (e.unique,e.groupName)
							field.field.widget.choices.append(aux)
				except AttributeError:
					pass
		
	#print form
	if synced:
		for sy in synced:
			ifShared = sy.share_set.all()
			if (ifShared):
				for i in ifShared:
					print i.typeOf_share
	if (synced == None):
		rendered = render(request, 'noShare.html')
	else:
		rendered = render(request, 'share.html', {'form': form,'synced':synced,'groups':groups})			
	return rendered

"""
@csrf_exempt		
def settings(request):
	


@csrf_exempt 	
def share(request):
	#print (somebody)
	#g = Group(name='Cool group')
	#g.save()
	response = HttpResponse()
	user = User.objects.get(email='shweta87.work@gmail.com')
	if (request.method == 'GET'):	
		s = Sync.objects.filter(user=user)
		for o in s:
			print (o.url)
		if (len(s) > 0):
			dumped = json.dumps(parseData(s))
			print (dumped)
			response = HttpResponse(dumped, content_type="application/json")
		else:
			response = HttpResponseNotFound()
			response['error'] = 'error_nothing_saved'
			response['error_nothing_saved'] = 'Nothing saved'
			response.content = 'Nothing saved yet for this user.'		
	elif (request.method == 'POST'):
		print (request.body)
		try:
			parsedData = json.loads(request.body)
			share_with = parsedData['share_with'] 	#the user's email with whom the request user wants to share.
			share_data = parsedData['share_data']
			for s in share_data:
				s['share_with'] = share_with	#email
				s['share_from'] = user
				#Check before!!!!!
				sharedData = saveShareData(s)
				if (sharedData['ifError'] == True):
					response = HttpResponseNotAllowed()
					response['error'] = sharedData['error_type']
					response.content = sharedData['error']
		except ValidationError:
			response = HttpResponseNotFound()
			response['error'] = 'no_such_user'
			response['no_such_user'] = 'Such user does not exist.'
			response.content = share_with + 'is not registered in this app.'
	return response
	
		
"""

def add(request):
	#creamos un grupo:
	response = HttpResponse()
	user = request.user
	groupName = 'Cool group'
	members = ['parihu@hotmail.com','shweta87.work@gmail.com','shweta.universidad@gmail.com']
	try:
		ug = UserGroup.objects.get(user=user)	#This has to be unique.
		print ug.groups.all()			#All the groups that the user is in
	except UserGroup.DoesNotExist:
		#No groups associated with the user.			
		ug = UserGroup(user=user)		#Create one
		ug.save()				#Save it.
	uid = uuid.uuid4()
	s = MyGroup(creator=user, groupName=groupName,unique=uid)
	s.save()
	for m in members:	#Add the members of this group
		u = User.objects.get(email=m)
		s.members.add(u)
	ug.groups.add(s)
	return response
	
	
	
	
	
def viewShared(request):
	user = request.user
	thisUser = User.objects.get(email=user.email)
	#First get all the things this user has shared
	try:
		ifNone = True
		shared_from_user = Share.objects.filter(shared_from=user)	#Share object list
		if shared_from_user:						#If this user has shared anything with anyone
			print "Yes shared!"
			for s in shared_from_user:
				t = s.shared.all()
				if (len(t) > 0):
					print "NOT NONE!!!"
					ifNone = False
					break			
				#print "ID = " + s.title
				"""s.delete()
				sh = s.shared.all()
				for h in sh:					
					print h.title"""
		if ifNone:
			print "NONE!"
			shared_from_user = None
				
		#for each shared object:
	except Share.DoesNotExist:
		shared_from_user = None
	#print "Share FRom USER"
	#print shared_from_user
	#Now try to get all the things others has shared with this user:
	try:
		shared_with_user = thisUser.shared_with_emails_set.all()	#Share object
		if shared_with_user:
			print "YES"
			print shared_with_user
			for su in shared_with_user:
				print "UNIQUE = " + su.unique
				#su.shared_with_emails.remove(thisUser)	
				sh = su.shared.all()
				#for h in sh:
					#print "Share with = " + str(h.title)
					
	except Share.DoesNotExist:
		shared_with_user = None
	
	#Now try to get all the groups of this user and their sharing things:
	try:
		user_group = UserGroup.objects.get(user=user)
		groups = user_group.groups.all()
		for g in groups:
			for sh in g.share_set.all():
				for t in sh.shared.all():
					print t.title
		
	except UserGroup.DoesNotExist:
		#This user does't belong to any group
		groups = None
	return render(request, 'sharedView.html', {'sharedFrom':shared_from_user,'sharedWith':shared_with_user,'sharedGroup':groups})



@csrf_exempt
def deleteFromGroup(request):
	#print request.body
	if (request.method == 'POST'):
		print request.POST
		groupId = request.POST['groupId']
		#Delete oneself from a group:
		try:
			response = HttpResponse()
			group = MyGroup.objects.get(unique=groupId)		#Get the group with the ID
			thisUser = User.objects.get(email=request.user.email)	#Get the user
			userGroup = UserGroup.objects.get(user=thisUser)	#Get all the groups the user is in
			userGroup.groups.remove(group)				#Remove this group from the user's table
			thisUserGroups = userGroup.groups.all()			#Now check if this user belongs to more groups
			if not thisUserGroups:	#Is this was the only group to which this user belonged to then delete the user's group record.
				print "No groups"
				userGroup.delete()
				group.members.remove(thisUser)
			#Lets see if there are any members in this group. If not then delete the record of this group:
			membersOfGroup = group.members.all()
			if not membersOfGroup:
				print "No memebers"
				group.delete()
		except MyGroup.DoesNotExist:
			response = HttpResponseNotFound()
	else:
		response = HttpResponseNotAllowed("ONLY POST ALLOWED")			

	return response

def handle_children(node, deviceId, user):
	print "Filter everything with the deviceId and owner"
	savedBookmark = Bookmark.objects.filter(deviceId=deviceId,owner=user)
	print savedBookmark
	child = savedBookmark.filter(itemId=node['itemId'])
	print "Try to get the child. " + str(node['itemId']) + " " + str(node['title'])
	#child = None
	if not child:
		print "Not created"
		title = node['title']
		itemId = node['itemId']
		url = node['url']
		dateAdded = node['dateAdded']/1000
		dateAdded = datetime.datetime.fromtimestamp(dateAdded/1000.0)
		#print str(dateAdded)
		lastModified = node['lastModified']/1000
		lastModified = datetime.datetime.fromtimestamp(lastModified/1000.0)
		#print str(lastModified)
		parentId = node['parentId']
		time = node['time']/1000
		time = datetime.datetime.fromtimestamp(time/1000.0)
		#print str(time)
		ifFolder = node['ifFolder']
		print "create child!"
	parent = savedBookmark.filter(itemId=node['parentId'])
	print "Try to get the parent " + str(node['parentId'])
	print len(parent)
	if parent:
		print "Parent Found!"
		for p in parent:
			child = Bookmark.objects.create(title=title,url=url,itemId=itemId,parentId=parentId,ifFolder=ifFolder,owner=user,deviceId=deviceId,parent=p)
			child.save()
			child.time = time
			child.dateAdded = dateAdded
			child.lastModified = lastModified
			child.save()
	if node['ifFolder']:
		if node['children']:
			for child in node['children']:
				handle_children(child,deviceId,user)
		
			
@csrf_exempt
def addNewBookmarks(request):
	response = HttpResponse()
	#print (element)
	#print (request.body)
	
	print request.META['HTTP_MYID']
	print request.META['HTTP_MYNAME']
	device_id = request.META['HTTP_MYID']
	device_name = request.META['HTTP_MYNAME']
	#print (request['myName'])
	#print (request['myId'])
	#print (request.META)
	#if (request.user.is_authenticated()):
	try:
		bookmarks = Bookmark.objects.filter(deviceId=device_id)
		bookmarks.delete()	#Delete everything saved. To remove redundance.
		parsedData = json.loads(request.body)
		#print parsedData
		owner = User.objects.get(email='shweta87.work@gmail.com')
		for p in parsedData:
			#Have to save each and every data:
		        title = p['title']
		        itemId = p['itemId']
		        parentId = p['parentId']
			#url = p['url']
			#itemId = p['itemId']
			#dateAdded = p['dateAdded']
			#lastModified = p['lastModified']
			#parentId = p['parentId']
			#time = p['time']
			#ifFolder = p['ifFolder']
			p['ifFolder'] = True
			print "*****Save this*****"
			print title
			savedBookmark = Bookmark(title=title,itemId=itemId,parentId=parentId,owner=owner,deviceId=device_id,ifFolder=True)
			savedBookmark.save()
			handle_children(p,device_id,owner)
			print p
		#for p in parsedData:
		#	handle_children(p,device_id,owner)
	except Bookmark.DoesNotExist:
		pass				
	return response

def parse_child(children, saveHere, owner):
	for child in children:
		c={}
		c['title'] = child.title
		c['url'] = child.url
		c['itemId'] = child.itemId
		c['parentId'] = child.parentId
		c['ifFolder'] = child.ifFolder
		c['dateAdded'] = child.dateAdded
		#print str(dateAdded)
		c['lastModified'] = child.lastModified
		#print str(lastModified)	
		c['time'] = child.time
		print "*********"
		print c['title']
		saveHere.append(c)
		if (c['ifFolder']):
			ch = Bookmark.objects.filter(owner=owner,itemId=c['itemId'])
			print "Results = "
			print len(ch)
			for t in ch:
				h = t.children.all()
				c['children'] = []
				if h:
					#parse_child(h,c['children'],owner)
					print h
			#if ch:
			#	print "*****"
			#	print c['title']
			#	c['children'] = []
		#		parse_child(ch,c['children'])
		#saveHere.append(child)
		#t['children'] = children"""
		
	
@csrf_exempt
def viewAllBookmarks(request):
	#Try to return all the bookmarks in a tuple
	deviceId = "{121e1c91-f701-4ff9-a137-f9f13e630da1}"
	owner = User.objects.get(email="shweta87.work@gmail.com")
	bookmarks = Bookmark.objects.filter(owner=owner,deviceId=deviceId, parentId=0)
	print len(bookmarks)
	bookmarksList = []
	for b in bookmarks:
		bookmarksList.append(b.serialize_to_json())
	print bookmarksList
	"""owner = User.objects.get(email='shweta87.work@gmail.com')
	#Have to put deviceId
	bookmarks = Bookmark.objects.filter(owner=owner)
	bookmarksList = []
	for b in bookmarks:
		if b.parentId is 0:
			t = {}
			t['title'] = b.title
			t['itemId'] = b.itemId
			t['parentId'] = b.parentId
			children = b.children.all()
			print "**************"
			print t['title']
			t['children'] = []
			parse_child(children,t['children'],owner)
			bookmarksList.append(t)
		
		else:
			t={}
			t['url'] = b.url
			t['dateAdded'] = t.dateAdded
			#print str(dateAdded)
			t['lastModified'] = t.lastModified
			#print str(lastModified)
			t['parentId'] = t.parentId
			t['time'] = t.time
			#time = datetime.datetime.fromtimestamp(time/1000.0)
			#print str(time)
			t['ifFolder'] = t.ifFolder
	print bookmarksList			
	response = HttpResponse()
	#response.write(children)"""
	rendered = render(request, 'bookmarks.html', {'nodes':Bookmark.objects.all()})
	return rendered
		
			
	








			
		
