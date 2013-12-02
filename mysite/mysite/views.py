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
from django.core.exceptions import ValidationError
from syncShare.models import validate_type
import json
from django.contrib.auth.models import User
from django.contrib.auth.models import Group
from forms import ShareForm
import uuid
#from friends.views import friendship_request
#from friends.views import friendship_accept
#from friends.models import FriendshipRequest




# @function parseData: Given a query_set, parse it to a list of dict objects.
# @param datasList {query_set}: contains a list of query_set objects.
# @return thisList {list}: A list of the parsed query_set to dict object.
def parseData(datasList):
	thisList = []
	for d in datasList:
		thisDict = {}
		thisDict['title'] = d.title
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
	return render(request, 'login.html')


"""
# @function ifDataExists: This function determines if the data that is going to be saved already exists or not
# @param aData {dict}:
#	--@title {string}: the title of the data to save.
#	--@url {URL}: the url of the data to save.
#	--@typeOf {"bookmarks","tabs" or "history"}: type of the data to save.
#	--@create {boolean}: create if it doesn't exist.
# @return datas {dict}:
#	--@exists {boolean}: if this data already exists in the Data table.
#	--@savedData {query_set}: set ofrom contact.forms import ContactFormnly if the data exists or if created.
def ifDataExists(aData):
	


def ifUserExists(aData):
	user = aData['user']
	create = aData['create']
	datas = {}
	try:
		savedUser = UsersData.objects.get(user=user)
		datas['exists'] = True
		datas['user'] = savedUser
	except UsersData.DoesNotExist:
		datas['exists'] = False
		if (create):
			savedUser = UsersData(user=user)
			savedUser.save()
			datas['user'] = savedUser
	return datas

"""
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

def saveShareData(aData):
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
	return render(request, 'welcome.html',{'email':request.user.email})


def hello():
	print("hello")
	
@csrf_exempt    	
#Without csrf_exempt the response sent to the add-on wasn't the desired one by us.
def save(request, element):
	response = HttpResponse()
	print (element)
	print (request.body)
	print (request.META)
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
	s = MyGroup(creator=user, groupName=groupName,unique=uid)
	s.save()
	for m in members:	#Add the members of this group
		u = User.objects.get(email=m)
		s.members.add(u)
	ug.groups.add(s)
	
	
@csrf_exempt
def share(request):
	response = HttpResponse()
	try:
		synced = Sync.objects.filter(user=request.user)
	except Sync.DoesNotExist:	#If this user hasn't synced anything yet.
		synced = None
		pass
	try:
		ug = UserGroup.objects.get(user=request.user)
		groups = ug.groups.all()
		for g in groups:
			title = ""
			thisGroupsMembers = g.members.all()
			for m in thisGroupsMembers:
				title = title + m.email + "\r\n"
			print title
	except UserGroup.DoesNotExist:
		groups = None
	if (request.method == 'POST'):#render the form
		form = ShareForm(request.POST)
		if form.is_valid():
			cd = form.cleaned_data
			print cd
			toShare = cd['toShare']
			print toShare
			shareWith = cd['friends_email']
			print shareWith
			#Try to save it:
			#saveShared = Share(shared_from=request.user)
			saveShared = Share(shared_from=request.user)
			saveShared.save()
			for checked in toShare:
				print checked
				shared = Sync.objects.get(unique=checked)
				#check_if_exist(shared,request.user)
				saveShared.shared.add(shared)
				for u in shareWith:
					shareWithUser = User.objects.get(email=u)
					saveShared.shared_with.add(shareWithUser)
			response.write("OK")
			return response
	else:
		# What has this user shared:
		thisShare = Share.objects.filter(shared_from=request.user)
		for l in thisShare:
			print l.shared_with.all()
			print l.shared.all()
		form = ShareForm()
		for field in form:
			if (field.name == 'toShare'):
				try:
					for s in synced:
						aux = (s.unique,s.title)
						field.field.widget.choices.append(aux)
					#print field.field.widget.choices
				except AttributeError:
					pass
			elif (field.name == 'existingGroups'):
				try:
					for e in groups:
						aux = (e.unique,e.groupName)
						field.field.widget.choices.append(aux)
				except AttributeError:
					pass
		
	print form
	if (synced == None):
		rendered = render(request, 'noShare.html')
	else:
		rendered = render(request, 'share.html', {'form': form,'synced':synced,'groups':groups})			
	return rendered
		


"""
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
	
	
	
	
	
	



















			
		
