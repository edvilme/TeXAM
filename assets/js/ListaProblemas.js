var script = document.createElement('script');
script.src = 'https://cdnjs.cloudflare.com/ajax/libs/geopattern/1.2.3/js/geopattern.min.js';
document.head.appendChild(script)

class ListaProblemas{
    creador;
    /**@type {Date} */
    fechaCreacion;
    /**@type {String} */
    descripcion;
    /**@type {String} */
    nombre;
    /**@type {Boolean} */
    estatusPublico;
    /**@type {Number} */
    likes;
    /**@type {Array} */
    probs = [];
    /**@type {Array} */
    tags = [];
    ref;
    constructor(){}
    /** Lee la referencia y devuelve un objeto con el creador
     * @returns {Promise<Usuario>}
     */
    async getCreador(){
        return (await this.creador.withConverter(UsuarioConverter).get()).data();
    }
    async getProblemas(){
        return this.probs.map(async problema=>{
            return (await problema.withConverter(ProblemaConverter).get()).data()
        })
    }
    async push(){
        if(this.ref == undefined){
            this.ref = await firebase.firestore().collection('listasProblemas').add({});
        }
        this.ref.withConverter(ListaProblemasConverter).set(this);
    }
    async obtenerTarjeta(props){
        let tarjeta = document.createElement('listaproblemas-card');
        tarjeta.setAttribute('creador', JSON.stringify(await this.getCreador()));
        tarjeta.setAttribute('fechaCreacion', this.fechaCreacion);
        tarjeta.setAttribute('nombre', this.nombre);
        tarjeta.setAttribute('descripcion', this.descripcion);
        tarjeta.setAttribute('estatusPublico', this.estatusPublico);

        tarjeta.addEventListener('followChange', ()=>{alert('Follow!')});
        return tarjeta;
    }
}

const ListaProblemasConverter = {
    toFirestore: (/**@type {ListaProblemas} */ listaProblemas)=>({
        creador: listaProblemas.creador,
        fechaCreacion: listaProblemas.fechaCreacion, 
        descripcion: listaProblemas.descripcion, 
        nombre: listaProblemas.nombre, 
        estatusPublico: listaProblemas.estatusPublico, 
        likes: listaProblemas.likes, 
        probs: listaProblemas.probs,
        tags: listaProblemas.tags,
    }),
    fromFirestore: (snapshot, options)=>{
        const data = snapshot.data(options);
        data.fechaCreacion = data.fechaCreacion.toDate()
        let listaProblemas = new ListaProblemas();
        Object.assign(listaProblemas, data);
        listaProblemas.ref = snapshot.ref;
        return listaProblemas;
    }
}

customElements.define('listaproblemas-card', class extends HTMLElement{
    constructor(){
        super();
        if(this.attributes.length>0) this.render();
    }
    render(){
        this.creador = typeof this.getAttribute('creador') == 'string' ? JSON.parse(this.getAttribute('creador')) : this.getAttribute('creador');
        this.fechaCreacion = typeof this.getAttribute('fechaCreacion') == 'string' ? new Date(this.getAttribute('fechaCreacion')) : this.getAttribute('fechaCreacion');
        this.nombre = this.getAttribute('nombre');
        this.descripcion = this.getAttribute('descripcion');
        this.estatusPublico = this.getAttribute('statusPublico');
        
        // let background = 

        let creador = document.createElement('usuario-card');
        creador.setAttribute('xsmall', true);
        creador.setAttribute('idUsuario', this.creador.idUsuario);
        creador.setAttribute('nombre', this.creador.nombre);
        creador.setAttribute('photoURL', this.creador.photoURL);
        creador.setAttribute('puntaje', this.creador.puntaje)
        creador.render()
        let detalles = Object.assign(document.createElement('div'), {className: 'detalles'});
        detalles.append(
            creador,
            Object.assign(document.createElement('span'), {innerHTML: this.fechaCreacion.toLocaleDateString(), className: 'fecha'})
        )
        let nombre = Object.assign(document.createElement('span'), {
            className: 'nombre', innerHTML: this.nombre
        })
        let descripcion = Object.assign(document.createElement('p'), {
            className: 'descripcion', innerHTML: this.descripcion
        })
        this.append(detalles, nombre, descripcion)
        
        let background = GeoPattern.generate(this.nombre, {baseColor: '#FFFFFF'}).toDataUrl();
        this.style.backgroundImage = background;

        if(window.usuarioActivo.idUsuario == this.creador.idUsuario){
            let button = Object.assign(document.createElement('button'), {
                className: 'follow', innerHTML: 'Seguir'
            })
            button.addEventListener('click', ()=>{
                this.dispatchEvent( new CustomEvent('followChange', {detail: true}) )
            })
            this.append(button)
        }

    }
})