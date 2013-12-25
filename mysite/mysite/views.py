from django.shortcuts import render
from django import template
from django.template.loader import get_template
from django.template import Context
from django.http import HttpResponse, HttpResponseNotFound, HttpResponseBadRequest, HttpResponseNotAllowed, HttpResponseRedirect
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
#from syncShare.models import UsersData
from syncShare.models import Sync
from syncShare.models import Share
from syncShare.models import MyGroup
from syncShare.models import UserGroup
from syncShare.models import Bookmark
from syncShare.models import History
from syncShare.models import Tab
from syncShare.models import UsersDevice
from django.core.exceptions import ValidationError
from syncShare.models import validate_type
import json
from django.contrib.auth.models import User
from forms import ShareForm
#from django.contrib.auth.models import Group
import uuid
import datetime
#import time
#from datetime import datetime
#from friends.views import friendship_request
#from friends.views import friendship_accept
#from friends.models import FriendshipRequest
from compare import compare
import itertools
from django.db import IntegrityError
from django.template import RequestContext

def get_senders_info(request):
	info = {}
	info['error'] = False
	try:
		info['device_id'] = request.META['HTTP_MYID']
		info['device_name'] = request.META['HTTP_MYNAME']
		info['device_type'] = request.META['HTTP_TYPE']
	except KeyError:
		info['error'] = True
	return info

@csrf_exempt		
def register_device(request):
	response = HttpResponse()
	print 'register!!!'
	if (request.user.is_authenticated()):
		user = request.user
		info = get_senders_info(request)
		if (info['error'] == False):
			device_id = info['device_id']
			device_name = info['device_name']
			device_type = info['device_type']
			try:
				unique = device_id + request.user.email
				aDevice = UsersDevice.objects.get(device_id=device_id,user=user,unique=unique,device_type=device_type)
				response = HttpResponseBadRequest()	#400
				response['error'] = 'device already exists'
			except UsersDevice.DoesNotExist:
				aDevice = UsersDevice(device_id=device_id,device_name=device_name,user=user,device_type=device_type)
				aDevice.save()
		else:
			response = HttpResponseNotAllowed('Invalid headers')
			response['error'] = 'Invalid headers'
		
	else:
		response.status_code = 401
		response['error'] = 'Unauthorized'
		response.content = 'Unauthorized'
	return response
		


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
		thisDict['user'] = d.user.email
		thisList.append(thisDict)
		#thisList['id'] = t.tabID
	return thisList


# @function main: This renders the Log in/ Log out page.
# @param request {request object}: The incoming request.
# @return a rendered template.
def main(request):
	#First check if the request was send from the app:
	return render(request, 'login.html',context_instance = RequestContext(request))


def logout(request):
	#First check if the request was send from the app:
	return render(request, 'logout.html',context_instance = RequestContext(request))


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
		#print(savedData.title)
		#print(savedData.url)
		#print(savedData.typeOf)
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
		#print (savedData.id)
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
	#print request.user.email
	#emails = []
	#emails.append('shweta87.work@gmail.com')
	#emails.append('parihu@gmail.com')
	#emails.append('parihu@gmail.com')
	#emails = sorted(set(emails))
	#print "EMAILS"
	"""thisUser = User.objects.get(email=request.user.email)
	shared = Share.objects.filter(shared_from=thisUser)
	if shared:
		print ("SI")
		for s in shared:
			s.shared_with_emails.remove("asdfkdskf")
	"""	
	
	user = request.user;
	bookmarks = user.bookmark_set.all().order_by('-addedDate')[:5]
	history = user.history_set.all().order_by('-addedDate')[:5]
	tabs = user.tab_set.all().order_by('-addedDate')[:5]
	shared = user.shared_from_set.all().order_by('-addedDate')[:5]
	savedItems = user.sync_set.all().order_by('-addedDate')[:5] 
	return render(request, 'welcome.html',{'bookmarks':bookmarks,'history':history,'tabs':tabs,'shared':shared,'savedItems':savedItems},context_instance = RequestContext(request))


def hello():
	print("hello")
	
@csrf_exempt    	
#Without csrf_exempt the response sent to the add-on wasn't the desired one by us.
def save(request, element):
	response = HttpResponse()
	#print (element)
	#print (request.body)
	#print (request.META)
	if (request.user.is_authenticated()):
		print "Save received!! from "
		try:
			print request.body
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
		print "Read received"
		#Get the table's entry:
		try:
			validate_type(element)
			user = request.user
			try:
				readData = Sync.objects.filter(user=user,typeOf=element)
				print (len(readData))
				if (len(readData) > 0):
					toSend = {}
					toSend[element] = parseData(readData)
					dumped = json.dumps(toSend)
					
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
		#print ug.groups.all()			#All the groups that the user is in
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

@login_required
@csrf_exempt
def deleteSync(request):
	#print request.user
	#print request.body
	#print request.POST
	if (request.user.is_authenticated()):
		if request.method == 'POST':
			uniqueId = request.POST['unique']
			print uniqueId
			try:
				s = Sync.objects.get(unique=uniqueId)
				shared = s.shared_set.all()
				if (s.user == request.user):
					if (shared.count()):
						shared.shared.remove(s)
					
					s.delete()
					response = HttpResponse()
					response.write("OK")
				else:
					response = HttpResponseNotAllowed("Only POST Allowed")
				
			except Sync.DoesNotExist:
				response = HttpResponseNotFound()
				response.write("Not Found");
		else:
			response = HttpResponseNotAllowed("Only POST Allowed")
	else:
		response.status_code= 401
		response['error'] = 'Unauthorized'
		response.content = 'Unauthorized'
	return response	

def checkIfEmpty(record):
	shared = record.shared.all()
	shared_bookmarks = record.shared_bookmarks.all()
	shared_history = record.shared_history.all()
	shared_tabs = record.shared_tabs.all()
	if (not shared.count() and not shared_bookmarks.count() and not shared_history.count() and not shared_tabs.count()):
		print "Empty: deleted!!!!"
		record.delete()
	
@login_required
@csrf_exempt
def deleteShareFromContent(request):
	print request.user
	print request.body
	print request.POST
	if (request.user.is_authenticated()):
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
					try:
						sync = Sync.objects.get(unique=toDeleteId)
						print "sync deleted"
						shared_content.shared.remove(sync)
					except Sync.DoesNotExist:
						response = HttpResponseNotFound()
						response.write("Not Found")
					checkIfEmpty(shared_content)
					#t = shared_content.shared.all()
					#print "Length of shared.all()"
					#print len(t)
					#if (len(t) is 0):
					#	print "deleted"
						#If it is 0, it means, there is nothing to share:
					#	shared_content.delete()
					#for h in t:
					#	print h.title
					#print "sync deleted 2"
					response = HttpResponse()
					response.write("OK")
				else:
					response = HttpResponseNotAllowed('You are not the owner')						
			except Share.DoesNotExist:
				response = HttpResponseNotFound()
				response.write("Not Found")			
		else:
			response = HttpResponseNotAllowed("Only POST allowed")
	else:
		response.status_code= 401
		response['error'] = 'Unauthorized'
		response.content = 'Unauthorized'
	#response= HttpResponse()
	return response
	
@login_required
@csrf_exempt
def deleteSharedWith(request):
	print request.user
	print request.body
	print request.POST
	if (request.user.is_authenticated()):
		if request.method == 'POST':
			#typeOf = request.POST['typeOf']
			shareId = request.POST['shareId']
			toDeleteId = request.POST['toDeleteId']
			typeOf =request.POST['typeOf']
			#uniqueId = request.POST['unique']
			#print uniqueId
		
			#Delete an item that the user was sharing with other users.
			try:
				shared_content = Share.objects.get(unique=shareId)
				shared_from = shared_content.shared_from
				if (shared_from.email == request.user.email):	#If the user is the owner
					if (typeOf == 'bookmark'):
						bookmark = Bookmark.objects.get(unique=toDeleteId)
						print "sync deleted"
						shared_content.shared_bookmarks.remove(bookmark)
					elif (typeOf == 'history'):
						history = History.objects.get(unique=toDeleteId)
						shared_content.shared_history.remove(history)
					elif (typeOf == 'tab'):
						tab = Tab.objects.get(unique=toDeleteId)
						shared_content.shared_tabs.remove(tab)
					checkIfEmpty(shared_content)
					#t = shared_content.shared.all()
					#print "Length of shared.all()"
					#print len(t)
					#if (len(t) is 0):
					#	print "deleted"
						#If it is 0, it means, there is nothing to share:
					#	shared_content.delete()
					#for h in t:
					#	print h.title
					#print "sync deleted 2"
					response = HttpResponse()
					response.write("OK")
				else:
					response = HttpResponseNotAllowed('You are not the owner')						
			except Share.DoesNotExist:
				response = HttpResponseNotFound()
				response.write("Not Found")		
			except Bookmark.DoesNotExist:
				response = HttpResponseNotFound()
				response.write("Not Found")	
			except History.DoesNotExist:
				response = HttpResponseNotFound()
				response.write("Not Found")	
			except Tab.DoesNotExist:
				response = HttpResponseNotFound()
				response.write("Not Found")	
					
		else:
			response = HttpResponseNotAllowed("Only POST allowed")
	else:
		response.status_code= 401
		response['error'] = 'Unauthorized'
		response.content = 'Unauthorized'
	#response= HttpResponse()
	return response
	

# @function share: This function is called when the url is /share/. It displays a form so that the user can
#		   choose what to share, with whom to share, what to do with the synced elements, etc.
# @param request {Request object}: contains the request object.
# @return a rendered template depending on:
#	-- if the user has nothing synced yet then the noShare.html template will be rendered.
#	-- if the user has something synced then the share.html template will be rendered.	
@login_required
@csrf_exempt
def share(request):
	response = HttpResponse()
	user = request.user
	#User's manually saved tabs.
	try:
		#first of all, try to fetch the user's manually synced tabs.
		synced = Sync.objects.filter(user=user)
		print "Synced = " + str(len(synced))
		if not synced:					#If it doesn't filter anything
			synced = None
	except Sync.DoesNotExist:				#If this user hasn't synced anything yet.
		synced = None
	#Get user's all devices:
	try:
		users_devices = UsersDevice.objects.filter(user=user)
		print "Users device = " + str(len(users_devices))
		if not users_devices:
			users_devices = None
	except UsersDevice.DoesNotExist:
		users_devices = None
	
	#User's all synced bookmarks from all devices
	try:
		synced_bookmarks = Bookmark.objects.filter(owner=user)
		print "Synced bookmarks = " + str(len(synced_bookmarks))
		if not synced_bookmarks:
			synced_bookmarks = None
	except Bookmarks.DoesNotExist:
		synced_bookmarks = None
	#User's all synced history from all devices.
	try:
		synced_history = History.objects.filter(owner=user)
		print "Synced history = " + str(len(synced_history))
		if not synced_history:
			synced_history = None
	except History.DoesNotExist:
		synced_history = None
	#User's all synced tabs from all devices	
	try:
		synced_tabs = Tab.objects.filter(owner=user)
		print "Synced tabs = " + str(synced_tabs.count())
		if not synced_tabs:
			synced_tabs = None
	except Tab.DoesNotExist:
		synced_tabs = None		
	try:
		#Now just try to see if this user belongs to any group.
		ug = UserGroup.objects.get(user=user)	
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
		print request.POST
		if form.is_valid():				#If the form is valid or not
			cd = form.cleaned_data			#Cleaned data
			print cd
			toShare = cd['toShare']			#These are the objects that are going to be shared 
			shareBookmarks = cd['shareBookmarks']
			shareHistory = cd['shareHistory']
			shareTabs = cd['shareTabs']
			uid = uuid.uuid4()
			uid = str(uid)
			saveShared = Share(shared_from=user,unique=uid)#Create a new entry for the share
			saveShared.save()
			for checked in toShare:			#Save all the checked objects
				print checked
				try:
					shared = Sync.objects.get(unique=checked)	#Get it from the synced object and add it
					#check_if_exist(shared,request.user)
					saveShared.shared.add(shared)
				except Sync.DoesNotExist:
					pass
			for checked in shareBookmarks:
				try:
					s_b = Bookmark.objects.get(unique=checked)
					saveShared.shared_bookmarks.add(s_b)
				except Bookmarks.DoesNotExist:
					pass
			for checked in shareHistory:
				try:
					s_h = History.objects.get(unique=checked)
					saveShared.shared_history.add(s_h)
				except History.DoesNotExist:
					pass
			for checked in shareTabs:
				try:
					s_t = Tab.objects.get(unique=checked)
					saveShared.shared_tabs.add(s_t)
				except Tab.DoesNotExist:
					pass
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
			rendered = render(request, 'shareCorrect.html',context_instance = RequestContext(request))			
			return rendered
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
			elif (field.name == 'shareBookmarks'):
				try:
					if not (synced_bookmarks == None):
						for b in synced_bookmarks:
							#unique_value = str(b.device.deviceId+str(b.itemId))
							aux = (b.unique,b.title)
							field.field.widget.choices.append(aux)
				
				except AttributeError:
					pass
			elif (field.name == 'shareHistory'):
				try:
					if not (synced_history == None):
						for h in synced_history:
							#unique_value = str(h.device.deviceId+h.url)
							aux = (h.unique,h.title)
							field.field.widget.choices.append(aux)
				
				except AttributeError:
					pass
			
			elif (field.name == 'shareTabs'):
				try:
					if not (synced_tabs == None):
						for t in synced_tabs:
							#unqiue_value = str(t.device.deviceId+t.url)
							aux = (t.unique,h.title)
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
	if (synced == None and synced_bookmarks == None and synced_tabs == None and synced_history == None):
		rendered = render(request, 'noShare.html',context_instance = RequestContext(request))
	else:
		rendered = render(request, 'share.html', {'form': form,'synced':synced,'groups':groups,'devices':users_devices},context_instance = RequestContext(request))			
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

@csrf_exempt	
def viewBookmarks(request):
	user = request.user
	try:
		users_devices = UsersDevice.objects.filter(user=user)
		print "Users device = " + str(len(users_devices))
		if not users_devices:
			users_devices = None
	except UsersDevice.DoesNotExist:
		users_devices = None
	
	return render(request, 'bookmarks.html', {'devices':users_devices},context_instance = RequestContext(request))	
	
	
@login_required	
def viewShared(request):
	user = request.user
	print user.email
	thisUser = User.objects.get(email=user.email)
	#First get all the things this user has shared
	try:
		#ifNone = True
		shared_from_user = Share.objects.filter(shared_from=thisUser)	#Share object list
		if shared_from_user:						#If this user has shared anything with anyone
			print "Yes shared!"
			for s in shared_from_user:
				t = s.shared.all()
				b = s.shared_bookmarks.all()
				print "Shared bookmarks " + str(len(b))
				h = s.shared_history.all()
				print "Shared history = "  + str(len(h))
				ta = s.shared_tabs.all()
				print "Shared tabs " + str(len(ta))
				"""if (len(t) > 0):
					print "NOT NONE!!!"
					#ifNone = False
					break			
				#print "ID = " + s.title
				s.delete()
				sh = s.shared.all()
				for h in sh:					
					print h.title"""
		#if ifNone:
		#	print "NONE!"
		#	shared_from_user = None
				
		#for each shared object:
	except Share.DoesNotExist:
		shared_from_user = None
	#print "Share FRom USER"
	#print shared_from_user
	#Now try to get all the things others has shared with this user:
	try:
		shared_with_user = thisUser.shared_with_emails_set.all()	#Share object
		if shared_with_user:
			#print "YES"
			print shared_with_user
			for su in shared_with_user:
				#print "UNIQUE = " + su.unique
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
	if (not shared_from_user and not shared_with_user and not groups):
		rendered = render(request, 'nothingShared.html',context_instance = RequestContext(request))
	else:
		rendered = render(request, 'sharedView.html', {'sharedFrom':shared_from_user,'sharedWith':shared_with_user,'sharedGroup':groups},context_instance = RequestContext(request))
	return rendered


@login_required
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
		except User.DoesNotExist:
			response = HttpResponseNotFound()
		except UserGroup.DoesNotExist:
			response = HttpResponseNotFound()
	else:
		response = HttpResponseNotAllowed("ONLY POST ALLOWED")			

	return response


def get_device(owner,device_id,device_name,device_type):
	print "*************GET DEVICE********************"
	createDevice = False
	try:
		unique = device_id + owner.email
		thisDevice = UsersDevice.objects.get(device_id=device_id,user=owner,unique=unique,device_type=device_type)
	except UsersDevice.DoesNotExist:
		print "Have to create device!!!!"
		createDevice = True
	
	if createDevice:
		try:
			thisDevice = UsersDevice(device_id=device_id,user=owner,device_name=device_name,device_type=device_type)
			thisDevice.save()
		except IntegrityError:
			unique = device_id + owner.email
			thisDevice = UsersDevice.objects.get(device_id=device_id,user=owner,device_type=device_type)
	return thisDevice




	
def handle_children(node, thisDevice, user):
	#print "Filter everything with the deviceId and owner"
	savedBookmarks = Bookmark.objects.filter(device=thisDevice,owner=user)
	#print savedBookmark
	title = node['title']
	itemId = node['itemId']
	parentId = node['parentId']
	#if parentId != 0:
		#print "Not main!"
	try:
		url = node['url']
		dateAdded = node['dateAdded']
		lastModified = node['lastModified']
		time = node['time']
		#child = savedBookmarks.filter(title=title,url=url)
	except KeyError:
		#child = savedBookmarks.filter(title=title)
		pass
	child = savedBookmarks.filter(itemId=itemId)
	ifFolder = node['ifFolder']
	#unique = str(thisDevice.device_id + str(itemId) + str(title) + str(parentId) + str(user.email))
	child_exists = True
	
	#print "Try to get the child. " + str(node['itemId']) + " " + str(node['title'])
	#child = None
	if not child:
		child_exists = False
		
	parent = savedBookmarks.filter(itemId=parentId)
	#print "Try to get the parent " + str(node['parentId'])
	#print len(parent)
	if parent:
		#print "Parent Found!"
		for p in parent:
			if (child_exists == False):
				child = Bookmark.objects.create(title=title,url=url,itemId=itemId,parentId=parentId,ifFolder=ifFolder,owner=user,device=thisDevice,parent=p,time=time,dateAdded=dateAdded,lastModified=lastModified)
				child.save()
			else:
				#print "exists and update"
				child.update(title=title,url=url,ifFolder=ifFolder,parentId=parentId,time=time,dateAdded=dateAdded,lastModified=lastModified)
	if node['ifFolder']:
		if node['children']:
			for child in node['children']:
				handle_children(child,thisDevice,user)
		
def getUsersBookmarks(user, device_id, device_name):
	bookmarksList = []
	thisDevice = UsersDevice.objects.get(user=user,device_id=device_id, device_name=device_name)
	savedBookmarks = Bookmark.objects.filter(owner=user,device=thisDevice,parentId=0)
	for b in savedBookmarks:
		bookmarksList.append(b.serialize_to_json())
	return bookmarksList
			
@csrf_exempt
def addNewBookmarks(request):
	response = HttpResponse()
	if (request.user.is_authenticated()):
		device_info = get_senders_info(request)
		info_error = device_info['error']
		if (info_error == False):
			owner = request.user
			device_id = device_info['device_id']
			device_name = device_info['device_name']
			device_type = device_info['device_type']
			#Guarantee that this device will exist
			thisDevice = get_device(owner,device_id,device_name,device_type)
			try:
				parsedData = json.loads(request.body)
				#sb = getUsersBookmarks(owner,device_id,device_name)
				#print parsedData
				#print sb
				#print set(enumerate(parsedData))
				search = True
				try:
					unique = device_id + request.user.email
					sD = UsersDevice.objects.get(unique=unique,user=owner,device_id=device_id,device_name=device_name)
				except UsersDevice.DoesNotExist:
					search = False
				if search == True:	
					sb = Bookmark.objects.filter(owner=owner,device=sD)
					toDelete = []
					for s in sb:
						print s.title + " : " + str(s.itemId)
						found = compare(s,parsedData,False)
						if (found == True):
							print s.title + " was " + str(found)
							#toSave.append(s)
						if (found == False):
							print "Have to delete " + s.title
							toDelete.append(s)
					#compare(parsedData, sb)
					owner = request.user
					for p in parsedData:
						#Have to save each and every data:
						title = p['title']
						itemId = p['itemId']
						parentId = p['parentId']
						p['ifFolder'] = True
						unique = str(device_id + str(itemId) + str(request.user.email))
						try:
							savedBookmark = Bookmark.objects.get(unique=unique)
						except Bookmark.DoesNotExist:
							savedBookmark = Bookmark(title=title,itemId=itemId,parentId=parentId,owner=owner,device=thisDevice,ifFolder=True)
							savedBookmark.save()
			
						handle_children(p,thisDevice,owner)
					for t in toDelete:
						related = t.share_set.all()
						if related:
							#print " Was being shared " + t.title
							for r in related:
								r.shared_bookmarks.remove(t)
								t.delete()
						else:
							#print " Was not being shared " + t.title
							t.delete()
			except Bookmark.DoesNotExist:
				pass
		else:
			response = HttpResponseNotAllowed('Invalid headers')
			response['error'] = 'Invalid headers'
				
	else:
		response.status_code= 401
		response['error'] = 'Unauthorized'
		response.content = 'Unauthorized'			
	return response


		
	
@csrf_exempt
def readAllBookmarks(request):
	response = HttpResponse()
	if (request.user.is_authenticated()):
		#Try to return all the bookmarks as a json object
		device_info = get_senders_info(request)
		info_error = device_info['error']
		if (info_error == False):
			owner = request.user
			device_id = device_info['device_id']
			device_name = device_info['device_name']
			device_type = device_info['device_type']
			print "Without excluded bookmarks "
			users_all_devices = UsersDevice.objects.filter(user=request.user)
			print users_all_devices.count()
			#thisDevice = get_device(owner,device_id,device_name)
			exclude_this_device = users_all_devices.exclude(device_id=device_id)
			exclude_this_device = exclude_this_device.exclude(device_type='mobile')
			print "WITH EXCLUDED Bookmarks : "
			print exclude_this_device.count()
			all_devices = []
			
			toSend = []
			for d in exclude_this_device:
				#all_devices.append(d.serialize_to_json())
				a_device = {}
				a_device['device'] = d.serialize_to_json() 
				bookmarks = d.bookmark_set.all()
				bookmarksList = []
				if bookmarks:
					for b in bookmarks:
						bookmarksList.append(b.serialize_to_json())
					a_device['bookmarks'] = bookmarksList
					toSend.append(a_device)
				print toSend
			response = HttpResponse(json.dumps(toSend),content_type='application/json')
		else:
			response = HttpResponseNotAllowed('Invalid headers')
			response['error'] = 'Invalid headers'
			
	else:
		response.status_code= 401
		response['error'] = 'Unauthorized'
		response.content = 'Unauthorized'
	return response
	
@csrf_exempt
def readAllHistory(request):
	response = HttpResponse()
	if (request.user.is_authenticated()):
		#Try to return all the bookmarks as a json object
		device_info = get_senders_info(request)
		info_error = device_info['error']
		if (info_error == False):
			owner = request.user
			device_id = device_info['device_id']
			device_name = device_info['device_name']
			device_type = device_info['device_type']
			users_all_devices = UsersDevice.objects.filter(user=request.user)
			#thisDevice = get_device(owner,device_id,device_name)
			exclude_this_device = users_all_devices.exclude(device_id=device_id)
			exclude_this_device = exclude_this_device.exclude(device_type='mobile')
			all_devices = []
			
			toSend = []
			for d in exclude_this_device:
				#all_devices.append(d.serialize_to_json())
				a_device = {}
				a_device['device'] = d.serialize_to_json()
				history = d.history_set.all()
				historyList = []
				if history:
					for h in history:
						historyList.append(h.serialize_to_json())
					a_device['history'] = historyList
					toSend.append(a_device)
			response = HttpResponse(json.dumps(toSend),content_type='application/json')
		else:
			response = HttpResponseNotAllowed('Invalid headers')
			response['error'] = 'Invalid headers'		
	else:
		response.status_code= 401
		response['error'] = 'Unauthorized'
		response.content = 'Unauthorized'
	return response
	
@csrf_exempt	
def readAllTabs(request):
	response = HttpResponse()
	if (request.user.is_authenticated()):
		#Try to return all the bookmarks as a json object
		device_info = get_senders_info(request)
		info_error = device_info['error']
		if (info_error == False):
			owner = request.user
			device_id = device_info['device_id']
			device_name = device_info['device_name']
			device_type = device_info['device_type']
			print device_id
			users_all_devices = UsersDevice.objects.filter(user=request.user)
			#Give the user the ones that are not from this device:
			all_devices = []
			
			toSend = []
			#thisDevice = UsersDevice.objects.get(user=request.user,device_id=device_id)
			#thisDevice = get_device(owner,device_id,device_name)
			print "******Without excluded******"
			print len(users_all_devices)
			excluded_this_device = users_all_devices.exclude(device_id=device_id)
			print "******With exclude******"
			print len(excluded_this_device)
			for d in excluded_this_device:
				#all_devices.append(d.serialize_to_json())
				a_device = {}
				a_device['device'] = d.serialize_to_json()
				print d.device_id
				tabs = d.tab_set.all()
				tabsList = []
				if tabs:
					print str(device_id) + " has tabs!"
					for t in tabs:
						tabsList.append(t.serialize_to_json())
					a_device['tabs'] = tabsList
					toSend.append(a_device)
			response = HttpResponse(json.dumps(toSend),content_type='application/json')
		else:
			response = HttpResponseNotAllowed('Invalid headers')
			response['error'] = 'Invalid headers'
	else:
		response.status_code= 401
		response['error'] = 'Unauthorized'
		response.content = 'Unauthorized'
	return response

	
@csrf_exempt			
def addNewHistory(request):
	response = HttpResponse()
	print (request.body)
	if (request.user.is_authenticated()):
		device_info = get_senders_info(request)
		info_error = device_info['error']
		if (info_error == False):
			owner = request.user
			device_id = device_info['device_id']
			device_name = device_info['device_name']
			device_type = device_info['device_type']
			thisDevice = get_device(owner,device_id,device_name,device_type)
			parsedData = json.loads(request.body)
			sh = History.objects.filter(owner=owner,device=thisDevice)
			toDelete = []
			#toSave = []
			found = False
			print parsedData
			for h in sh:
				for p in parsedData:
					if (h.title == p['title'] and h.url == p['url']):
						print "Yes!!!"
						#toSave.append(p)
						found = True
						break
					else:
						found = False
				if found == False:
					toDelete.append(h)
					print "Have to delete: "
					print toDelete
			for p in parsedData:
				title = p['title']
				url = p['url']
				visited = p['visited']
				lastVisited = p['lastVisited']
				unique = str(device_id + str(url) + str(request.user.email))
				if (title == None):
					if (url != None):
						title = url
				try:
					savedHistory = History.objects.get(unique=unique)
					savedHistory.visited=visited
					savedHistory.save()
					savedHistory.time=lastVisited
					savedHistory.save()
					#print "Exists"
				except History.DoesNotExist:
					#print "Does not"
					savedHistory = History.objects.create(title=title,url=url,time=lastVisited,device=thisDevice,owner=owner,visited=visited)
					savedHistory.save()
				#print savedHistory.title + ' is saved'
			for t in toDelete:
				related = t.share_set.all()
				if related:
					#print " Was being shared " + t.title
					for r in related:
						r.shared_history.remove(t)
						t.delete()
				else:
					print " Was not being shared " + t.title
					t.delete()
	
		else:
			response = HttpResponseNotAllowed('Invalid headers')
			response['error'] = 'Invalid headers'
			
	else:
		response.status_code= 401
		response['error'] = 'Unauthorized'
		response.content = 'Unauthorized'
				
	return response

	
@csrf_exempt
def addNewTabs(request):
	response = HttpResponse()
	if (request.user.is_authenticated()):
		device_info = get_senders_info(request)
		info_error = device_info['error']
		if (info_error == False):
			owner = request.user
			device_id = device_info['device_id']
			device_name = device_info['device_name']
			device_type = device_info['device_type']
			thisDevice = get_device(owner,device_id,device_name,device_type)		#Get user's device
			parsedData = json.loads(request.body)
			found = False
			st = Tab.objects.filter(owner=owner,device=thisDevice)
			toDelete = []
			#toSave = []
			found = False
			print parsedData
			for t in st:
				for p in parsedData:
					if (t.url == p['url']):
						print p['url'] + " already exists!!"
						#toSave.append(p)
						found = True
						break
					else:
						found = False
				
				if found == False:
					print str(p['url'] + 'was not found!')
					toDelete.append(t)
					print "Have to delete: "
					print toDelete
			
			for p in parsedData:
				title = p['title']
				url = p['url']
				ID = p['id']
				if (title == None):
						title = url
				try:
					unique = str(device_id + url+owner.email)
					savedTabs = Tab.objects.get(unique=unique)
					print p['url'] + " tab exists!"
					savedTabs.tabID=ID
					savedTabs.save()
				except Tab.DoesNotExist:
					print p['url'] + " doesn't exist!!"
					
					
					savedTabs = Tab(title=title,url=url,tabID=ID,device=thisDevice,owner=owner)
					savedTabs.save()
			for t in toDelete:
				related = t.share_set.all()
				if related:
					#print " Was being shared " + t.title
					for r in related:
						r.shared_tabs.remove(t)
						t.delete()
				else:
					print " Was not being shared " + t.url
					t.delete()
		else:
			response = HttpResponseNotAllowed('Invalid headers')
			response['error'] = 'Invalid headers'
			
	else:
		response.status_code= 401
		response['error'] = 'Unauthorized'
		response.content = 'Unauthorized'	
	return response
	
	


def changeDeviceName(request):
	response = HttpResponse()
	if request.user.is_authenticated():
		device_info = get_senders_info(request)
		info_error = device_info['error']
		if (info_error == False):
			owner = request.user
			device_id = device_info['device_id']
			device_type = device_info['device_type']
			new_device_name = device_info['device_name']
			print device_id
			print device_type
			print new_device_name
			try:
				unique = device_id + request.user.email
				thisDevice = UsersDevice.objects.get(unique=unique,user=request.user,device_id=device_id)
				thisDevice.device_name = new_device_name
				thisDevice.save()
			except UsersDevice.DoesNotExist:
				thisDevice = UsersDevice(user=request.user,device_id=device_id,device_name=new_device_name)
				thisDevice.save()
			
			
		else:
			response = HttpResponseNotAllowed('Invalid headers')
			response['error'] = 'Invalid headers'	
			
	else:
		response.status_code= 401
		response['error'] = 'Unauthorized'
		response.content = 'Unauthorized'
	return response





			
		
