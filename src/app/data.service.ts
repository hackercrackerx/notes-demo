import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { Observable, Subscription, BehaviorSubject } from 'rxjs';
import { Note } from '../models/note.interface';
import { map} from 'rxjs/operators';
import { AngularFireAuth } from '@angular/fire/auth';


@Injectable({
  providedIn: 'root'
})
export class DataService {

  private notesCollection: AngularFirestoreCollection<Note>;
  public notes: Observable<Note[]>;
  private authStatus:Subscription;
  private uid:string;
  public notes$ = new BehaviorSubject<Note[]>([]);

  constructor(private afs: AngularFirestore, private afauth: AngularFireAuth) {
    // get the user auth status
    this.authStatus = afauth.authState.subscribe((user) => {
      if (user) {
        //get user Id
        this.uid = user.uid;
        //create path
        let path = `notes/${this.uid}/usernotes`;
        //set the collection
        this.notesCollection = afs.collection<Note>(path);
        // get notes
        this.getNotes().subscribe((notes)=>{
          this.notes$.next( notes );
        })

      }
    })
  }

  addNote( data: Note){
    this.notesCollection.add( data );
  }

  getNotes(){
    return this.notesCollection.snapshotChanges()
    .pipe( map(actions => actions.map( a=>{
      const data = a.payload.doc.data() as Note;
      const id = a.payload.doc.id;
      return { id, ...data};
    })))
  }

  updateNote( note ){
    this.notesCollection.doc( note.id ).update({
      name: note.name,
      note: note.note
    });
  }
}
