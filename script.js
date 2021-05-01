((rootElement='') =>{
	class SectionListProto{
		constructor(){
			this.sectionElem = this.createSection();
		}
			
		createElement(tag, options=[], cssClasses=[]){
			const elem = document.createElement(tag, options=[]);
			cssClasses.forEach(cssClass => elem.classList.add(cssClass));
			return elem;
		}

		createSection(){
			return this.createElement('section');
		}
	}
	/* ------------------------------------------------------------------------------------- */
	class ListUrls extends SectionListProto{
		constructor(){
			super();
			this.updateSection({cssClass:'app-section'});
			this.isURLCheckboxChecked = false;
			this.arrayUrls = [];
			this.key = 0; // key for <li>
		}

		updateSection({cssClass}){
			this.sectionElem.classList.add(cssClass);
			this.sectionElem.innerHTML =
				`<h2>Список URL</h2>
				<form class='app-section__input-form'>
					<input class='app-section__input' placeholder="Вводите URL строго с  http(s):// or www.">
					<button class='app-section__btn add-button'>Add URL</button>
				</form>
				<label>
					<input type="checkbox" name="checkbox"><span class="app-section__span-checkbox">Отключена проверка валидности URL</span>
				</label>
				<hr>

				<div class='app-section__urls'>
					<ul class='app-section__ul-records'></ul>
				</div>`;
			this.sectionElem.addEventListener('click', (event)=>{
				this.handlerClick(event);
			});
			this.sectionElem.querySelector('.app-section__input-form').addEventListener('submit', event => event.preventDefault());
			this.checkbox = this.sectionElem.querySelector('[name="checkbox"]');
			this.checkbox.addEventListener('change', (event) => {
				this.isURLCheckboxChecked = this.checkbox.checked;
				this.isURLCheckboxChecked ? this.sectionElem.querySelector('.app-section__span-checkbox').innerHTML = 'Включена проверка валидности URL' :
											this.sectionElem.querySelector('.app-section__span-checkbox').innerHTML = 'Отключена проверка валидности URL';

			});
		}

		checkValidUrl(url){
			//const match = /(https?:\/\/|www.)/.exec(url);
			const match = url.match(/^(https?:\/\/|www.)/);
			if(match===null) {
				return false;
			} else {
				return true;
			}
		}

		createUrlLiElem(url){
			const template= 
				`<div class='app-section__a-href'><a data-track-attr='true' href=${url} target='_blank' title=${url}> ${url} </a></div>
				<button class='app-section__btn app-section__remove-button'>Remove</button>`;
			const child = this.createElement('li');
			child.setAttribute('data-key', `url${this.key}`);
			
			child.innerHTML = template;

			//this.arrayUrls.push({  // !!! 11-04-2021 UNSHIFT вместо PUSH
			this.arrayUrls.unshift({
				key: `url${this.key++}`,
				url: url
			});

			return child;
		}

		checkDuplicationUrl(url){
			const idx = this.arrayUrls.findIndex(item => (item.url === url));
			if(idx === -1) {return -1;}
			else {return idx;}
		}

		highlightUrlElem(key){
			const duplicatedElem = this.sectionElem.querySelector(`li[data-key="${key}"]`);
			duplicatedElem.classList.add('app-section__a-href--bk');
			duplicatedElem.scrollIntoView();
			duplicatedElem.focus();
			setTimeout(()=>duplicatedElem.classList.remove('app-section__a-href--bk'),
				3000);
		}

		addNewRecord(parentNode){
			if (parentNode === undefined) return;
			const inputUrlElem = this.sectionElem.querySelector('.app-section__input');
			const url = inputUrlElem.value;

			const idxDuplication = this.checkDuplicationUrl(url);
			if (idxDuplication !== -1){
				alert(`Такой URL  уже есть в строке под №${idxDuplication+1}`);
				this.highlightUrlElem(this.arrayUrls[idxDuplication].key);
				return;
			}
					
					/*вкл проверка checkbox и невалидный URL*/
			if( this.isURLCheckboxChecked && !this.checkValidUrl(url) ) 
				if (!window.confirm('Wrong URL. Are you sure?')) return;
			
			//parentNode.appendChild(this.createUrlLiElem(url)); // !!! 11-04-2021 PREPEND вместо CHILD
			parentNode.prepend(this.createUrlLiElem(url));

			inputUrlElem.focus();
			inputUrlElem.select();
		}

		removeRecord(event){
			const key = event.target.parentElement.dataset.key;
			const idx = this.arrayUrls.findIndex(item => item.key.toString() === key);

			if(idx !== -1) this.arrayUrls.splice(idx, 1);

			//if(window.confirm('Are you sure? The record will be lost!!!'))
				event.target.parentElement.remove();
		}

		handlerClick(event){
			if(event.target.tagName !== 'BUTTON') return;

			if(event.target.classList.contains('add-button')){
				const parent = document.querySelector('.app-section__ul-records');
				this.addNewRecord(parent);

			} else if(event.target.classList.contains('app-section__remove-button')){
				this.removeRecord(event);
			}
		}

	}

	/* ------------------------------------------------------------------------------------- */
	class Tracking extends SectionListProto{
		constructor(){
			super();
			document.documentElement.addEventListener('click', (event) => this.handlerClick(event), true); // capturing

			this.table=null;
			
			this.arrayClicks = [];
			this.sectionElem.appendChild(this.createBtnToSection('Load tracking data', 
				()=>this.handlerLoadTrackData())
			);

			this.sectionElem.appendChild(this.createBtnToSection('Delete data. Restart tracking.', 
				()=>this.handlerRestart())
			);

			
		}

		createBtnToSection(innerText, handler){
			const btn = this.createElement('BUTTON', [], ['track-section__btn']);
			btn.innerText = innerText;

			btn.addEventListener('click', event => {
				handler(event);
			});

			return btn;
		}

		handlerRestart(){
			this.arrayClicks = [];
			
			if(this.table !== null) {
				
				this.table.innerHTML = '';
		
				this.table = null;
			}
		}

		handlerLoadTrackData(){
			const tbody= this.createTBodyTable();
			const tableRecords = this.arrayClicks.map(item => this.createTrTable(item))
				.join('');
			tbody.innerHTML = tableRecords;


			//let table = this.sectionElem.querySelector('.tracking__table');
			
			if(this.table === null){
				this.table = this.createTableWithTrackingData('tracking__table');
				this.table.appendChild(tbody);
				this.sectionElem.appendChild(this.table);
			} else{
				const tBodyOld = this.table.querySelector('TBODY');
				if(tBodyOld !== null) tBodyOld.replaceWith(tbody);
			}
		}

		createTableWithTrackingData(css){
			const template = 
			`	<thead>
					<tr>
						<th>Id</th>
						<th>tag</th>
						<th>innerText</th>
						<th>date</th>
						<th>pathFromHtml</th>
					</tr>
				</thead>
			`
			const table = this.createElement('TABLE');
			table.classList.add(css);
			table.innerHTML = template;
			return table;
		}

		createTBodyTable(){
			return this.createElement('TBODY');
		}

		createTrTable({id, tag, innerText, date, pathFromHtml}){
			return(
			`
			<tr>
				<td>${id}</td>
				<td>${tag}</td>
				<td>${innerText}</td>
				<td>${date}</td>
				<td>${pathFromHtml}</td>
			</tr>
			`
			);
		}



		getPathHtmlToTarget(target){
			const parent = target.parentElement;
			
			while(parent !== document.documentElement){
				return this.getPathHtmlToTarget(parent) + '/' + target.tagName;
			}

			return ('HTML'+'/'+target.tagName);
		}

		handlerClick(event) {
			let clickInfo = {};
			const date = new Date();

			if(event.clientX==0 && event.clientY===0 && event.x===0 && event.y===0 && event.target.tagName === 'BUTTON') return; /* 12-04-21 чтобы не ловить событие инициированное от формы */

			if(event.target.tagName === 'BUTTON' || event.target.dataset.hasOwnProperty('trackAttr')){
				//console.log(event.target.tagName);

				clickInfo = {
					id: event.target.getAttribute('id'),
					tag: event.target.tagName,
					innerText: `${event.target.innerText===undefined ? '' : event.target.innerText}`,
					date: date,
					pathFromHtml: this.getPathHtmlToTarget(event.target)
				}
				
				this.arrayClicks.push(clickInfo);
			}
		}
	}

	/* 
			- Главная программа -
	*/
	
	const root = document.querySelector(rootElement);
	const listUrls = new ListUrls();
	root.appendChild(listUrls.sectionElem);

	const tracking = new Tracking();
	root.appendChild(tracking.sectionElem);
})('#root')




//document.querySelector('.app-section__ul-records').innerHTML = addNewUrlRecord('ddd');