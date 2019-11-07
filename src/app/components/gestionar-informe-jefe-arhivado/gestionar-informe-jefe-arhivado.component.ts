import { Component, OnInit } from '@angular/core';
import { InformeEstudiante } from '../../interfaces/informe-estudiante.interface';
import { AppInformeEstudianteService } from '../../services/app-informe-estudiante.service';
import { Persona } from '../../interfaces/persona.interface';
import { AppTipoPersonaService } from '../../services/app-tipoPersona.service';
import { Convenio } from 'src/app/interfaces/convenio.interface';
import { AppAreaService } from '../../services/app-area.service';
import { Area } from 'src/app/interfaces/area.interface';
import { Departamento } from 'src/app/interfaces/departamento.interface';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-gestionar-informe-jefe-arhivado',
  templateUrl: './gestionar-informe-jefe-arhivado.component.html',
  styleUrls: ['./gestionar-informe-jefe-arhivado.component.css']
})
export class GestionarInformeJefeArhivadoComponent implements OnInit {

  //Variable global para almacenar el id del departamento
  IdDepartamento:string = "1";
  IdUser:string = "1";
  //Lista de los estudiantes del total horas/saldos
  listInformeEstudiante:InformeEstudiante[];
  auxDepartamento:Departamento;
  //ALERTS
  titleAlert:string = null;
  messageAlert:string = null;
  activateAlert:boolean = false;
  alertSuccess:Boolean = false;
  alertError:Boolean = false;
  alertWarning:boolean = false;
  //Info Estudiante
  codEstudiante:string;
  nombreCompleto:string;
  nacionalidad: string;
  direccion: string;
  ci: string;
  celular: string;
  nombreDepartamento:string;
  fechaNacimiento: string;
  estadoPersona: boolean;
  carrera:string
  semestre:string
  beca:string;
  estadoConvenio:string;
  fotocopiaCI;
  solicitudWork;
  fechaInicio;
  fechaFinal;
  observacionesRegistroHora:string;
  areas:any[] = [];
  //
  informeEstudiante:InformeEstudiante = {};

  //Lista de estudiantes del departameto
  estudiantes:Convenio[];

  constructor(private _appInformeEstudianteService:AppInformeEstudianteService,
              private _appTipoPersonaService:AppTipoPersonaService,
              private _appAreaService:AppAreaService,
              private _authService : AuthService) { }
  ngOnInit() {
    this.getDepartamentoUser();
    this.getInfomeEstudiante(this.IdDepartamento);
  }

  alert(opcion:number, title:string, message:string):void{
    if(opcion == 1) this.alertSuccess = true;
    if(opcion == 2) this.alertError = true;      
    if(opcion == 3) this.alertWarning = true;      
    this.titleAlert = title;
    this.messageAlert = message;
    this.activateAlert = true;
    setTimeout(() => {
      this.activateAlert = false;
      this.alertSuccess = false;
      this.alertError = false;
      this.alertWarning = false;
    }, 5000);
  }
  getDepartamentoUser(){
    this.auxDepartamento =  this._authService.getDatosDepartamento();    
    this.IdDepartamento = this.auxDepartamento[0].idDepartamento;
  }

  //gestionar informe estudiante
  //informe Estudiante horas and balance
  getInfomeEstudiante(idDepartamento:string){
    this._appInformeEstudianteService.getInformeArchivado(idDepartamento)
    .subscribe((informe : InformeEstudiante[]) => {this.listInformeEstudiante = informe})
  }


  informacionEstudiante(idRegistroHora, idEstudiante){
    this.areas = [];

    this._appTipoPersonaService.getInfoEstudiantes(this.IdDepartamento , idEstudiante)
    .subscribe((estudiantes : Persona[]) => {
      this.estudiantes = estudiantes;
      for(let estudiante of this.estudiantes){
        if(estudiante.idPersona == idEstudiante){
          if (estudiante.segundoNombre == null && estudiante.segundoApellido != null ) {
            this.nombreCompleto = estudiante.primerNombre + " " + estudiante.primerApellido + " " + estudiante.segundoApellido;
          } else if (estudiante.segundoNombre == null && estudiante.segundoApellido == null){
            this.nombreCompleto = estudiante.primerNombre + " " + estudiante.primerApellido; 
          }else if (estudiante.segundoNombre != null && estudiante.segundoApellido == null){ 
            this.nombreCompleto = estudiante.primerNombre + " " + estudiante.segundoNombre + " " + estudiante.primerApellido;   
          }else{
            this.nombreCompleto = estudiante.primerNombre + " " + estudiante.segundoNombre + " " + estudiante.primerApellido + " " + estudiante.segundoApellido;
          }
            this.codEstudiante = estudiante.codEstudiante;
            this.nacionalidad = estudiante.nacionalidad;
            this.direccion = estudiante.direccion;
            this.celular = estudiante.celular;
            this.ci = estudiante.ci;
            this.fechaNacimiento = estudiante.fechaNacimiento;
            this.estadoPersona = estudiante.estadoPersona;
            this.carrera = estudiante.carrera;
            this.semestre = estudiante.semestre;
            this.nombreDepartamento = estudiante.departamento;
            this.beca = estudiante.beca;
            this.estadoConvenio = estudiante.estadoConvenio;
            this.fechaInicio = estudiante.fechaInicio;
            this.fechaFinal = estudiante.fechaFinal;
            this.fotocopiaCI = estudiante.fotocopiaCarnet;
            this.solicitudWork = estudiante.solicitudTrabajo;
            this._appAreaService.getAsignacionByConvenio(estudiante.idConvenio)
              .subscribe((data: Area[]) => {
                if(data.length > 0){
                  for(let a of data){
                    this.areas.push(a.nombreArea);
                  }
                }
              });
        }
      }
    });

    for(let registro of this.listInformeEstudiante){
      if(registro.idPersona == idEstudiante && registro.idRegistroHora == idRegistroHora){
        this.observacionesRegistroHora = registro.observacionRegistroHora;
      }
    }
  }

  archivarInforme(idInformeEstudiante){
    this.informeEstudiante.archivar = "NO";
    this._appInformeEstudianteService.putInformeArchivar(idInformeEstudiante, this.informeEstudiante)
    .subscribe((informe : InformeEstudiante[]) => {
      this.getInfomeEstudiante(this.IdDepartamento);
      this.alert(1, 'Registro desarchivado', 'El registro fue desarchivado satisfactoriamente.');
    }, res => {
      this.alert(2, 'Error al desarchivado', 'Se ha producido un error en el servidor al desarchivado.');
    });
  }

}
