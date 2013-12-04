from django.db import models
from django.contrib.auth.models import User
from django.contrib.auth.models import Group
from django.core.exceptions import ValidationError


# @class validate_type: This is to validate the typeOf field in the user's table.
# 	--@valid {boolean}: checks if the given value is valid or not, being the valid
#			    ones: tabs, bookmarks or history
#	--Raise ValidationError if it is not one of the specified valid values.			    
def validate_type(value):
	valid = ((value == 'tabs') or (value == 'bookmarks') or (value == 'history'))
    	if (valid == False):
    		#Raise validation error, if not valid.
        	raise ValidationError(u'%s is not a valid type' % value)	



"""def validate_user(user):
	try:
		u = User.objects.get(email=user.email)
	except User.DoesNotExist:
		raise ValidationError(u'%s is not a registered user' %user.email)


class Tab(models.Model):
	#user = models.ForeignKey(User,primary_key=True)	#Whose tab is this.
	title = models.TextField(max_length = 140)		#the tabs title.
	url = models.URLField()					#the tabs url
	
	def __unicode__(self):
        	return self.title


#@class Bookmark: This defines the bookmarks item in the database.
#	-- @user {User}: is the user associated to this bookmark.
#	-- @title {String}: is the bookmark's title.
#	-- @url {URL}: is the bookmark's url.
	
class Bookmark(models.Model):
	title = models.TextField(max_length = 140)	#the bookmark's title
	url = models.URLField()
	
	def __unicode__(self):
        	return self.title				#the bookmark's url


#@class History: This defines the history item in the database.
#	-- @user {User}: is the user associated to this history.
#	-- @title {String}: is the history's title.
#	-- @url {URL}: is the history's url.
		
class History(models.Model):
	title = models.TextField(max_length = 140)	#the history's title
	url = models.URLField()				#the history's url.
	
	def __unicode__(self):
        	return self.title
"""

# @class Sync: This table contains all saved/synced items by a user.
#	-- @user {User}: is the user who saved a item, it's a reference to the auth_user table.
#	-- @title {String}: is the saved page's title.
#	-- @url {URL}: is the saved page's url.
#	-- @typeOf {string}: can only be tabs, bookmarks or history.
class Sync(models.Model):
	user = models.ForeignKey(User)
	title = models.TextField(max_length = 250)	
	url = models.URLField()
	typeOf = models.CharField(max_length = 9, validators = [validate_type])
	unique = models.CharField(max_length=100, null=True, blank=True, unique=True)
		
	def __unicode__(self):
        	 return (u'%(owner)s has saved a %(typeOf)s with title %(title)s') %{
        	 	'owner': (self.user.email),
        	 	'typeOf': (self.typeOf),
        	 	'title': (self.title),
        	 }
        
        


class MyGroup(models.Model):
	creator = models.ForeignKey(User, related_name='creator_set')
	members = models.ManyToManyField(User, related_name='members_set')
	groupName = models.CharField(max_length=100)
	unique = models.CharField(max_length=100, null=True, blank=True, unique=True)
	
	def __unicode__ (self):
		return (u'%s' %(self.groupName))
	



# @class Share {model}: This table contains the shared items between two users.
#	-- @shared {Sync model}: is the reference to the sync model, it is the shared item.
#	-- @shared_with {User}: With whom it is shared with
class Share(models.Model):
	shared = models.ManyToManyField(Sync)
	shared_from = models.ForeignKey(User,related_name='shared_from_set')
	typeOf_share = models.CharField(max_length=5)
	#friend = models.ForeignKey(User, related_name='friends')
	shared_with_group = models.ManyToManyField(MyGroup)
	shared_with_emails = models.ManyToManyField(User, related_name='shared_with_emails_set')
	unique = models.CharField(max_length=100, null=True, blank=True, unique=True)
	
	def __unicode__(self):
		return (u'%(owner)s is sharing') %{
        	 	'owner': (self.shared_from.email),
        	 }
	

class UserGroup(models.Model):
	user = models.OneToOneField(User)
	groups = models.ManyToManyField(MyGroup)
	
	def __unicode__ (self):
		return (u'%s' %(self.user.email))

	
  
"""
# @class UsersData: This table contains all user's saved features
#	-- @user {User}: is the user associated to this table.
#	-- @data {Data}: is the data to save for this user.	
class UsersData(models.Model):
	user = models.EmailField(primary_key=True,unique=True)
	data = models.ManyToManyField(Data)
	#title = models.TextField(max_length = 250)	
	#url = models.URLField()
	#typeOf = models.CharField(max_length = 9, validators = [validate_type])
		
	
	def __unicode__(self):
		return self.user

"""




