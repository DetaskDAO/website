export const ADD_TODO = 'ADD_TO';

export function addTodo(text) {
    return  { type: ADD_TODO, text}
}