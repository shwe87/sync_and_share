if request.method == 'POST':
		form = ShareForm(request.POST)
		if form.is_valid():
		    #print request.POST.getlist('aCheckBox')
		    cd = form.cleaned_data
		    print (cd['aCheckBox'])
		    #email = cd ['email']
		    #group = cd['group']
		    #existing_group = cd['existing_groups']
		    #html = '<html></html>'
		    print (cd)
		    return HttpResponse()
	    else:
		#AddFriendsForm['fields'].choice_field.choices = (('1', 'First and only',),)
		form = ShareForm()
		#print (form['aCheckBox'].choices)
		#form['choice_field'] = (('1','First only',),) 
	       # print (form['choose'].id_for_label)
		#form['choose'].queryset = Sync.objects.filter(user=request.user)
		for field in form.choose:
			try:
				s = Sync(user=request.user)
				field.field.queryset = s
				#print (field.field.widget.choices)
				#aux = field.field.widget.choices
				#print (aux)
				#aux.append(("NEP","NEPAL"))
				#field.field.widget.choices.append(("NEP","<a href='http://www.google.com'>Google</a>"))
				#print (field.field.widget.choices)
				#print ("NAme " + str(field.field.widget))
				#(field.field.widget.name)
				#field.field.widget.id_for_label = 'Nepal'
				#print (field.field.widget.id_for_label)
			except AttributeError:
				pass
		print form
	    return render(request, 'share.html', {'form': form})
