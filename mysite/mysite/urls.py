from django.conf.urls import patterns, include, url
from django.contrib import auth
# Uncomment the next two lines to enable the admin:
from django.contrib import admin
import syncShare


admin.autodiscover()

urlpatterns = patterns('',
        (r'^login/$','mysite.views.main'),
	(r'^browserid/', include('django_browserid.urls')),
	(r'^save/(?P<element>[\w]+)/$','mysite.views.save'),
	(r'^read/(?P<element>[\w]+)/$','mysite.views.read'),
	(r'^add/$','mysite.views.add'),
	(r'^share/$','mysite.views.share'),
	#(r'^save/bookmarks/','browseridTest.views.saveBookmarks'),
	#(r'^save/history','browseridTest.views.saveHistory'),
	(r'^$', 'mysite.views.welcome'),
	
	
    # Examples:
    # url(r'^$', 'browseridTest.views.home', name='home'),
    # url(r'^browseridTest/', include('browseridTest.foo.urls')),

    # Uncomment the admin/doc line below to enable admin documentation:
    # url(r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Uncomment the next line to enable the admin:
     url(r'^admin/', include(admin.site.urls)),
)