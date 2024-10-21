import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { EditTaskDialogComponent } from './dialogs/edit-task-dialog/edit-task-dialog.component';
import { DeleteTaskDialogComponent } from './dialogs/delete-task-dialog/delete-task-dialog.component';
import { AddTaskDialogComponent } from './dialogs/add-task-dialog/add-task-dialog.component';
import { FormsModule } from '@angular/forms';

const GET_TASKS = gql`
  query GetTasks($filters: FilterTasksInput!) {
    tasks(filters: $filters) {
      id
      title
      status
    }
  }
`;

const UPDATE_TASK = gql`
  mutation UpdateTask($task: UpdateTaskInput!) {
    updateTask(updateTaskInput: $task) {
      id
      title
      status
    }
  }
`;

const CREATE_TASK = gql`
  mutation UpdateTask($task: CreateTaskInput!) {
    createTask(createTaskInput: $task) {
      id
      title
      status
    }
  }
`;

const DELETE_TASK = gql`
  mutation RemoveTask($id: String!) {
    removeTask(id: $id) {
      id
    }
  }
`;

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatIconModule,
    MatButtonModule,
    FormsModule,
  ],
  templateUrl: './tasks.component.html',
  styleUrl: './tasks.component.css',
})
export class TasksComponent implements OnInit {
  tasks: { id: string; title: string; status: boolean }[] = [];
  status: 'null' | 'true' | 'false' = 'null';
  searchTerm: string = '';
  searchTimeout: any;

  constructor(private readonly apollo: Apollo, public dialog: MatDialog) {}

  openTaskUpdateDialog = (task: any): void => {
    const dialogRef = this.dialog.open(EditTaskDialogComponent, {
      width: '400px',
      data: task,
    });

    dialogRef.afterClosed().subscribe((updatedTask) => {
      if (updatedTask) {
        this.apollo
          .mutate({
            mutation: UPDATE_TASK,
            variables: {
              task: {
                title: updatedTask.title,
                status: task.status,
                id: this.tasks.find((t) => t.id === task.id)?.id,
              },
            },
            refetchQueries: [
              {
                fetchPolicy: 'no-cache',
                query: GET_TASKS,
                variables: {
                  filters: {
                    searchTerm: this.searchTerm,
                    status:
                      typeof JSON.parse(this.status) === 'boolean'
                        ? JSON.parse(this.status)
                        : null,
                  },
                },
              },
            ],
          })
          .subscribe();
      }
    });
  };

  openTaskCreateDialog = (): void => {
    const dialogRef = this.dialog.open(AddTaskDialogComponent, {
      width: '400px',
      data: {},
    });

    dialogRef.afterClosed().subscribe((createdTask) => {
      if (createdTask) {
        this.apollo
          .mutate({
            mutation: CREATE_TASK,
            variables: {
              task: {
                title: createdTask.title,
              },
            },
            refetchQueries: [
              {
                fetchPolicy: 'no-cache',
                query: GET_TASKS,
                variables: {
                  filters: {
                    searchTerm: this.searchTerm,
                    status:
                      typeof JSON.parse(this.status) === 'boolean'
                        ? JSON.parse(this.status)
                        : null,
                  },
                },
              },
            ],
          })
          .subscribe();
      }
    });
  };

  openDeleteUpdateDialog = (task: any): void => {
    const dialogRef = this.dialog.open(DeleteTaskDialogComponent, {
      width: '400px',
      data: task,
    });

    dialogRef.afterClosed().subscribe((deletedTask) => {
      if (deletedTask) {
        this.apollo
          .mutate({
            mutation: DELETE_TASK,
            variables: { id: task.id },
            refetchQueries: [
              {
                fetchPolicy: 'no-cache',
                query: GET_TASKS,
                variables: {
                  filters: {
                    searchTerm: this.searchTerm,
                    status:
                      typeof JSON.parse(this.status) === 'boolean'
                        ? JSON.parse(this.status)
                        : null,
                  },
                },
              },
            ],
          })
          .subscribe();
      }
    });
  };

  onToggleComplete = (task: any, status: boolean): void => {
    this.apollo
      .mutate({
        mutation: UPDATE_TASK,
        variables: { task: { id: task.id, title: task.title, status } },
        refetchQueries: [
          {
            fetchPolicy: 'no-cache',
            query: GET_TASKS,
            variables: {
              filters: {
                searchTerm: this.searchTerm,
                status:
                  typeof JSON.parse(this.status) === 'boolean'
                    ? JSON.parse(this.status)
                    : null,
              },
            },
          },
        ],
      })
      .subscribe();
  };

  onSearchChange = (): void => {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.fetchTasks();
    }, 300);
  };

  onStatusChange = (): void => {
    this.fetchTasks();
  };

  fetchTasks = () => {
    this.apollo
      .watchQuery<any>({
        fetchPolicy: 'cache-and-network',
        query: GET_TASKS,
        variables: {
          filters: {
            searchTerm: this.searchTerm,
            status:
              typeof JSON.parse(this.status) === 'boolean'
                ? JSON.parse(this.status)
                : null,
          },
        },
      })
      .valueChanges.subscribe(({ data, error }: any) => {
        this.tasks = data.tasks;
      });
  };

  ngOnInit(): void {
    this.fetchTasks();
  }
}
