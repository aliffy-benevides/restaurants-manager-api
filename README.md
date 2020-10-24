# Restaurant Manager API
RESTful API that can manage restaurants and menu products.

## Features
* List restaurants
* Show restaurant's data
* Create restaurant
* Update restaurant
* Delete restaurant
* List products of a restaurant
* Create product of a restaurant
* Update product of a restaurant
* Delete product of a restaurant

## Architecture
This system was designed based on the layered architecture and has the following structure:
* Entity
  ![Entities Image](./media/entities.png)
* Repository
  ![Repositories Image](./media/repositories.png)
* Controller
  ![Controllers Image](./media/controllers.png)

## How to setup and run
  

## How to use
The following endpoints are available to use the API.
- **Restaurant endpoints**:
  - **List restaurants**
    List of all created restaurants.
    Return type: RestaurantEntity[].
    - Example:
      ```shell
      curl --request GET \
        --url {{ baseUrl }}/restaurants
      ```
  - **Show restaurant**
    Information about the restaurant specified by the parameter `id`.
    Return type: FullRestaurantEntity.
    - Example:
      ```shell
      curl --request GET \
        --url {{ baseUrl }}/restaurants/:id
      ```
  - **Create restaurant**
    Create a restaurant with the object received by body.
    Body type: FullRestaurantEntity in format JSON.
    Return type: void.
    - Example:
      ```shell
      curl --request POST \
        --url {{ baseUrl }}/restaurants \
        --header 'content-type: application/json' \
        --data '{
          "photo_url": "Photo url",
          "name": "Restaurant name",
          "address": "Restaurant address",
          "hours": [
            { "day": 1, "start": "08:00", "end": "17:00" },
            { "day": 2, "start": "08:00", "end": "17:00" }
          ]
        }'
      ```
  - **Update restaurant**
    Update the restaurant specified by the parameter `id` with the object received by body.
    Body type: FullRestaurantEntity in format JSON.
    Return type: void.
    - Example:
      ```shell
      curl --request PUT \
        --url {{ baseUrl }}/restaurants/:id \
        --header 'content-type: application/json' \
        --data '{
          "photo_url": "Photo url",
          "name": "Updated name",
          "address": "Restaurant address",
          "hours": [
            { "day": 1, "start": "08:00", "end": "17:00" },
            { "day": 2, "start": "08:00", "end": "17:00" }
          ]
        }'
      ```
  - **Delete restaurant**
    Delete the restaurant specified by the parameter `id`.
    Return type: void.
    - Example:
      ```shell
      curl --request DELETE \
        --url {{ baseUrl }}/restaurants/:id
      ```

- **Product endpoints**:
  - **List products**
    List of all created products of the restaurant specified by the parameter `restaurantId`.
    Return tpye: FullProductEntity[].
    - Example:
      ```shell
      curl --request GET \
        --url {{ baseUrl }}/restaurants/:restaurantId/products
      ```
  - **Create product**
    Create a product with the object received by body for the restaurant specified by parameter `restaurantId`.
    Body type: FullProductEntity in format JSON.
    Return type: void.
    - Example:
      ```shell
      curl --request POST \
        --url {{ baseUrl }}/restaurants/:restaurantId/products \
        --header 'content-type: application/json' \
        --data '{
          "photo_url": "Photo url",
          "name": "Product name",
          "price": 25.99,
          "category": "Product category",
          "promotions": [{
            "description": "Promotion description",
            "price": 19.99,
            "hours": [
              { "day": 1, "start": "08:00", "end": "17:00" },
              { "day": 2, "start": "08:00", "end": "17:00" }
            ]
          }]
        }'
      ```
  - **Update product**
    Update the product specified by the parameter `id` in the restaurant specified by the parameter `restaurantId` with the object received by body.
    Body type: FullProductEntity in format JSON.
    Return type: void.
    - Example:
      ```shell
      curl --request PUT \
        --url {{ baseUrl }}/restaurants/:restaurantId/products/:id \
        --header 'content-type: application/json' \
        --data '{
          "photo_url": "Photo url",
          "name": "Updated name",
          "price": 25.99,
          "category": "Product category",
          "promotions": [{
            "description": "Promotion description",
            "price": 19.99,
            "hours": [
              { "day": 1, "start": "08:00", "end": "17:00" },
              { "day": 2, "start": "08:00", "end": "17:00" }
            ]
          }]
        }'
      ```
  - **Delete product**
    Delete the product specified by the parameter `id` in the restaurant specified by the parameter `restaurantId`.
    Return type: void.
    - Example:
      ```shell
      curl --request DELETE \
        --url {{ baseUrl }}/restaurants/:restaurantId/products/:id
      ```
