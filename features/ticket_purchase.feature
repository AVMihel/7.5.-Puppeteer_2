Feature: Ticket Purchase for Movie Session
  
  Scenario: Booking one VIP seat
    Given user is on the cinema homepage
    When user selects day "Чт"
    And user selects session at "17:00"
    And user selects VIP seat
    And user confirms booking
    Then booking confirmation message is displayed

  Scenario: Booking two adjacent standard seats
    Given user is on the cinema homepage
    When user selects day "Пт"
    And user selects session at "20:00"
    And user selects two adjacent standard seats
    And user confirms booking
    Then booking confirmation message is displayed

  Scenario: Attempting to book already taken seat
    Given user is on the cinema homepage
    When user selects day "Сб"
    And user selects session at "11:00"
    And user tries to select taken seat
    Then booking confirmation button is disabled
    And booking is not possible