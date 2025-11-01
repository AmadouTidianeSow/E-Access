// src/app/admin/users-roles/users-roles.component.ts

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { User, UserService } from '../services/user.service';

@Component({
  selector: 'app-users-roles',
  templateUrl: './users-roles.component.html',
  styleUrls: ['./users-roles.component.scss'],
})
export class UsersRolesComponent implements OnInit {
  users: User[] = [];
  roles: User['role'][] = ['admin', 'agent', 'employe'];

  // Formulaire pour créer un nouvel utilisateur
  createForm!: FormGroup;
  creating = false;

  // Si on veut éditer inline un utilisateur existant
  editFormMap: { [id: string]: FormGroup } = {};

  constructor(
    private userService: UserService,
    private fb: FormBuilder,
  ) {}

  ngOnInit(): void {
    this.loadUsers();
    this.createForm = this.fb.group({
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      login: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      role: ['agent', Validators.required],
    });
  }

  private loadUsers() {
    this.userService.listUsers().subscribe({
      next: users => {
        this.users = users;
        // Préparer un FormGroup d'édition pour chaque user
        this.users.forEach(u => {
          this.editFormMap[u.id] = this.fb.group({
            nom: [u.nom, Validators.required],
            prenom: [u.prenom, Validators.required],
            login: [u.login, [Validators.required, Validators.email]],
            role: [u.role, Validators.required],
          });
        });
      },
      error: err => console.error(err),
    });
  }

  toggleCreate() {
    this.creating = !this.creating;
    if (!this.creating) {
      this.createForm.reset({ role: 'agent' });
    }
  }

  createUser() {
    if (this.createForm.invalid) return;
    this.userService.createUser(this.createForm.value).subscribe({
      next: () => {
        this.loadUsers();
        this.toggleCreate();
      },
      error: err => console.error(err),
    });
  }

  /**
   * Lorsqu'un rôle change sur un utilisateur existant,
   * on utilise updateUser() pour patcher son rôle.
   */
  onRoleChange(user: User, newRole: User['role']) {
    this.userService.updateUser(user.id, { role: newRole }).subscribe({
      next: () => this.loadUsers(),
      error: err => console.error(err),
    });
  }

  /**
   * Si tu veux permettre la modification inline des champs nom/prenom/login :
   */
  saveEdits(user: User) {
    const form = this.editFormMap[user.id];
    if (form.invalid) return;
    this.userService.updateUser(user.id, form.value).subscribe({
      next: () => this.loadUsers(),
      error: err => console.error(err),
    });
  }

  deleteUser(user: User) {
    if (!confirm(`Supprimer ${user.nom} ${user.prenom} ?`)) return;
    this.userService.deleteUser(user.id).subscribe({
      next: () => this.loadUsers(),
      error: err => console.error(err),
    });
  }
}
