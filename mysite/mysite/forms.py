from django import forms

#def validate_email(value):
from django.core.validators import validate_email
#from django.core.validators import email_re
import re
from django.core.exceptions import ValidationError
from django.forms import ModelForm
from django.contrib.auth.models import User
from syncShare.models import UserGroup

def validate_user(email):
	try:
		u = User.objects.get(email=email)
	except User.DoesNotExist:
		raise User.DoesNotExist(u'%s is not a registered user' %email)
		

class MultiEmailField(forms.Field):
     def clean(self, value):
        """
        Check that the field contains one or more comma-separated emails
        and normalizes the data to a list of the email strings.
        """
        
        #emails = value.split(',')
        
	emails = re.compile(r'[^\w\.\-\+@_]+').split(value)
	
        for email in emails:
            	if value:
		    try:
		    	validate_email(email)
		    	validate_user(email)
		    except ValidationError:
		    	raise forms.ValidationError('%s is not a valid e-mail address.' % email)
		    except User.DoesNotExist:
		    	raise forms.ValidationError('%s is not a registered user.' %email)
		else:
			emails = None
		

        # Always return the cleaned data.
        return emails	
        
"""class MyGroupField(forms.Field):
	def clean(self,value):

		user = self.user
		if not value:
			raise forms.ValidationError('Enter a group name.')
		#Get all the groups that the user is in:
		exists = True
		try:
			ug = UserGroup.objects.get(user=user)
			groups = ug.groups.all()
			for g in groups:
				if (g.groupName == )
		except UserGroup.DoesNotExist:
			exists = False
		
"""		
	
#CHOICES = (('1', 'First',), ('2', 'Second',))
class ShareForm(forms.Form):
	SHARE_OPTIONS = ()
	SELECT_OPTIONS = (
			('1','Share by email address'),
			('2','Create a group and share'),
			('3','Share with existing group/s')
			)
	GROUP_OPTIONS = ()
	toShare = forms.MultipleChoiceField(widget=forms.CheckboxSelectMultiple,choices=SHARE_OPTIONS)
	selectFrom = forms.ChoiceField(widget=forms.Select(attrs={'id':'selectTypeWhom'}),choices=SELECT_OPTIONS)
	friends_email = MultiEmailField(help_text='Write emails separated by commas', required=False);
	group_name = forms.CharField(max_length=100,label='Group Name', help_text='Maximum 100 characters', required=False)
	existingGroups = forms.MultipleChoiceField(widget=forms.CheckboxSelectMultiple,choices=GROUP_OPTIONS,required=False)
	
	
	def __init__(self, *args, **kwargs):
		self.request = kwargs.pop('request', None)
		super(ShareForm, self).__init__(*args, **kwargs)
	#choose = forms.ModelMultipleChoiceField()
	def clean(self):
        	cleaned_data = super(ShareForm, self).clean()
        	friends_email = cleaned_data.get("friends_email")
        	group_name = cleaned_data.get("group_name")
        	existingGroups = cleaned_data.get("existingGroups")
        	selectFrom = cleaned_data.get("selectFrom")
		
		if friends_email:
			# Clear the duplicate emails:
			friends_email = sorted(set(friends_email))
			#print "Multiemail = " + self.request.user.email
			try: #Remove the user who requested this
				friends_email.remove(self.request.user.email)
			except ValueError:
				pass
            	#self._errors["subject"] = self.error_class([msg])
            	"""if not friends_email:
        			raise forms.ValidationError(u"Friends email can't be empty.")
        	if not(group_name and friends_email):
        			raise forms.ValidationError(u"The group name field and the friends' emails should be filled.")
        	if not existingGroups:
        			raise forms.ValidationError(u"At least one group should be checked.")"""
        	if (selectFrom == '1'):
        		#print ("1111111111111111111111111111111111111111")
        		#print len(friends_email)
        		if not friends_email or friends_email == None:
        			#print ("2222222222")
        			raise forms.ValidationError(u"Friends email can't be empty. Or you are trying to share to yourself.")
        	elif (selectFrom == '2'):
        		if not(group_name and friends_email):
        			raise forms.ValidationError(u"The group name field and the friends' emails should be filled.")
        	elif (selectFrom == '3'):
        		if not existingGroups:
        			raise forms.ValidationError(u"At least one group should be checked.")
        	"""if not (friends_email and group_name and existingGroups):
        		raise forms.ValidationError("Must choose one of the sharing options.")"""
            	
            	return cleaned_data









