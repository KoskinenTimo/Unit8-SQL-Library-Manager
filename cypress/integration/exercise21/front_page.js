/* eslint-disable no-undef */
describe('Pokedex', function() {
  it('front page can be opened', function() {
    cy.visit('http://localhost:3000')
    cy.contains('My Books')
    cy.contains('A collection of different books, you can use the search feature for all attributes.')
  })
})