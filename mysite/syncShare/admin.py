from django.contrib import admin
#from syncShare.models import Tab
#from syncShare.models import UsersData
from syncShare.models import Sync
from syncShare.models import Share
from syncShare.models import MyGroup
from syncShare.models import UserGroup



admin.site.register(Sync)
admin.site.register(Share)
admin.site.register(MyGroup)
admin.site.register(UserGroup)
#admin.site.register(History)
