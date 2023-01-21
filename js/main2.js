function ajaxCallback(path, result){
    $.ajax({
        url: `data/${path}.json`,
        method: "get",
        dataType: "json",
        success: result,
        error: (xhr, exception) =>{
            var errorMessage = '';
            if (xhr.status === 0){
                errorMessage = 'You are not connected, please check your internet connection';
            }
            else if(xhr.status == 404){
                errorMessage = 'Error 404 page not found.';
            } 
            else if(xhr.status == 500){
                errorMessage = 'Error 500 internal server error';
            } 
            else if(exception === 'parsererror'){
                errorMessage = 'JSON parse failed';
            } 
            else if(exception === 'timeout'){
                errorMessage = 'Time out error.';
            } 
            else if(exception === 'abort'){
                errorMessage = 'Ajax request aborted.';
            } 
            else{
                errorMessage = 'Uncaught Error.\n' + xhr.responseText;
            }
            alert(errorMessage);
        }
    })
}
function setLS(name, data){
    localStorage.setItem(name, JSON.stringify(data));
}
function getLS(name){
    return JSON.parse(localStorage.getItem(name));
}
function removeLS(name){
    return localStorage.removeItem(name);
}
let errors = [];
let total;
let deliver;
window.onload = function(){
    let url = window.location.pathname;
    ajaxCallback("nav", (result)=>{
        showNav(result);
    });
    if(url == "/shop.html"){
        ajaxCallback("types", (result)=>{
            setLS("types", result);
            showFilter(result, "type");
        });
        ajaxCallback("brands", (result)=>{
            setLS("brands", result);
            showFilter(result, "brand");
        });
        ajaxCallback("products", (result)=>{
            setLS("products", result);
            showProducts(result);
        });
    }
    else if(url == "/cart.html"){
        showCart();
    }  
    else if(url == "/checkout.html"){
        let productsFromCart = getLS("cart");
        if(productsFromCart == null || productsFromCart.length == 0){
            $('#delivery-checkout').html(`<span>Delivery</span><span>$0.00</span>`);
            $('#total-checkout').html(`<span>Total</span><span>$0.00</span>`);
        }
        else{
            let chk = getLS("total");
            $('#delivery-checkout').html(`<span>Delivery</span><span>$${chk.deliver}</span>`);
            $('#total-checkout').html(`<span>Total</span><span>$${(chk.total + chk.deliver).toFixed(2)}</span>`);
        }        
    }
    else if(url == "/product-single.html"){
        loadSingle();
    }    
}
$('#sort').change(function(){
    showProducts(getLS("products"));
});
$('#search').keyup(function(){
    showProducts(getLS("products"));
});
function loadSingle(){
    let single = getLS("single")[0];
    let html = `<div class="col-lg-6 mb-5">
                    <a href="img/${single.img.src}" class="d-flex justify-content-center image-popup prod-img-bg"><img src="img/${single.img.src}" class="img-fluid" alt="dsd"></a>
                </div>
                <div class="col-lg-6 product-details pl-md-5">
                    <h3>${single.name}</h3>
                    <p class="price"><span>$${single.price.new}</span></p>
                    <p>${single.desctription}</p>
                    <div class="row mt-4">
                            <div class="input-group col-md-6 d-flex mb-3">
                    <input type='number' id="quantity" class="quantity form-control input-number" value='1' min='1' max='100' />                    
                </div>
                </div>
                <input type='button' data-sid='${single.id}' class="btn btn-black py-3 px-5 mr-2 add-to-cart" value='Add to Cart'>
                </div>`;
    $('#specific').html(html);
    $('.add-to-cart').click(addToCart);
}
function special(){
    let orderNUmber = $('#quantity').val();
}
function showNav(data){
    let html = "";
    for(i of data){
        html += `<li class="nav-item"><a href="${i.href}" class="nav-link">${i.text}</a></li>`
    }
    $('#dynamic-nav').html(html);
    $('#dynamic-nav').append(`<li class="nav-item cta cta-colored"><a href="cart.html" class="nav-link"><span id='product-cart-number' class="icon-shopping_cart">[${getLS("cart") == null ? 0 : getLS("cart").length}]</span></a></li>`);
    let url = (window.location.pathname);
    $(`a[href='${url.substring(1, url.length)}']`).addClass("active");
}
function showProducts(data){
    data = groupFilter(data);
    data = searchData(data);
    data = sort(data);
    let html = "";
    if(data.length == 0){
        html = "<p class='alert alert-danger'>Oops, it looks like we don't have sneackers</p>"
    }
    else{
        for(i of data){
            html += `<div class="col-sm-12 col-md-12 col-lg-4 d-flex">
                        <div class="product d-flex flex-column">
                            <p class="img-prod single" data-single=${i.id}><img class="img-fluid" src="img/${i.img.src}" alt="${i.img.alt}">
                                <div class="overlay"></div>
                            </p>
                            <div class="text py-3 pb-4 px-3">
                                <div class="d-flex">
                                    <div class="cat">
                                        <span>${getInfo(i.type, "types")}</span>
                                    </div>
                                    <div class="rating">
                                        <p class="text-right mb-0">
                                        ${getInfo(i.brand, "brands")}
                                        </p>
                                    </div>
                                </div>
                                <h3><p class='single' data-single=${i.id}>${i.name}</p></h3>
                                <div class="pricing">
                                    
                                    <p class="price">${getPrice(i.price.old, i.price.new)}</p>
                                </div>
                                <p class="bottom-area d-flex px-3 add-crt">
                                    
                                    <button data-id=${i.id} class="add-to-cart text-center add-product"><span>Add to cart <i class="ion-ios-add ml-1"></i></span></button>
                                </p>
                            </div>
                        </div>
                    </div>`;      
        }
    }
    $('#products').html(html);
    $('.add-to-cart').click(addToCart);
    $('.single').click(function(){
        removeLS("single");
        setLS("single", data.filter(x => x.id == $(this).data('single')));
        window.location.href = "product-single.html"
    });
}
function showFilter(data, filter){
    let html = "";
    for(i of data){
        html += `<li class='d-flex align-items-center'>
                    <input type="checkbox" id="${filter}-${i.id}" class='${filter} mr-2' value='${i.id}' />
                    <label for="${filter}-${i.id}">${i.name}</label>
                </li>`;
    }
    $(`#${filter}s`).html(html);
    $(`.${filter}`).change(function(){
        showProducts(getLS("products"));
    });
    showProducts(getLS("products"));
}
function getInfo(id, info){
    return getLS(info).filter(x => x.id == id)[0].name;
}
function getPrice(oldPrice, newPrice){
    let html = "";
    if(oldPrice != null){
        html += `<span class="mr-2 price-dc">$${oldPrice}</span>`
    }
    html += `<span class="price-sale">$${newPrice}</span>`;
    return html;
}
function groupFilter(data){
    let selectedBrands = [];
    let selectedType = [];
    $('.brand:checked').each(function(){
        selectedBrands.push(parseInt($(this).val()));
    });
    $(`.type:checked`).each(function(){
        selectedType.push(parseInt($(this).val()));
    });
    if(selectedBrands.length != 0){
        data =  data.filter(x => selectedBrands.includes(x.brand));	
    }
    if(selectedType.length != 0){
        data = data.filter(x => selectedType.includes(x.type));
    }
    return data;
}
function sort(data){
    let type = $('#sort option:selected').val();
    let en = data.sort((a,b)=>{
        if(type == '1'){
            return a.price.new - b.price.new;
        }
        else if(type == "2") return b.price.new - a.price.new;
        else if(type == "3"){
            if(a.name < b.name){
                return -1;
            }
            else if(a.name > b.name){
                return 1;
            }
            else return 0;
        }
        else if(type == "4"){
            if(a.name > b.name){
                return -1;
            }
            else if(a.name < b.name){
                return 1;
            }
            else return 0;
        }
        else return JSON.parse(localStorage.getItem("products"));
    });
    return en;
}
function searchData(data){
    let search = $("#search").val().toLowerCase();
    if(search){
        return data.filter(el=>{
            return el.name.toLowerCase().indexOf(search) !== -1;
        })
    }
    return data;
}
function addToCart(){
    if(parseInt($('#quantity').val()) < 1){
        formCheck("true", false, "quantity", "Quantity can't be lower than 1");
        return;
    }
    formCheck("true", "true", "quantity");
    addedToCartMessage();
    let products = getLS("cart");
    let qty = 1;
    let idProduct = $(this).data("id");
    if(idProduct == undefined){
        idProduct = $(this).data('sid');
        qty = $('#quantity').val();
        $('#quantity').val(1);
    }
    if(products){
        if(products.filter(p => p.id == idProduct).length){
            products.filter(x => x.id == idProduct)[0].quantity = parseInt(qty) + parseInt(products.filter(x => x.id == idProduct)[0].quantity);
            setLS("cart", products);
        }
        else{
            products.push({
                id: idProduct,
                quantity: qty
            });
            setLS("cart", products);
        }
    }
    else{
        let product = [];
        product[0] = {
            id: idProduct,
            //quantity: 1
            quantity: qty
        }
        setLS("cart", product);
    }
    numberOfProducts();
}
function numberOfProducts(){
    let number = getLS("cart").length;
    if(number == 0){
        $("#product-cart-number").html(`[0]`);
    }
    else{
        $("#product-cart-number").html(`[${number}]`);
    }
}
function showCart(){
    let productsFromCart = getLS("cart");
    if(productsFromCart == null || productsFromCart.length == 0){
        $('#cart').html("<p class='alert alert-danger'>Your cart is empty</p>");
        $('#finish-cart').hide();
    }
    else{
        let allProducts = getLS("products");
        let display = allProducts.filter(product =>{
            
            for(let productLS of productsFromCart){
                if(product.id == productLS.id){
                    product.quantity = productLS.quantity
                    return true;
                }
            }
            return false;
        });
        showProductsInCart(display);
    }
}
function showProductsInCart(products){
    total = 0;
    let html = `<table class="table">
                    <thead class="thead-primary">
                    <tr class="text-center">
                        <th>&nbsp;</th>
                        <th>&nbsp;</th>
                        <th>Product</th>
                        <th>Price</th>
                        <th>Quantity</th>
                        <th>Total</th>
                    </tr>
                    </thead>
                    <tbody>`;
    for(i of products){
        let altQty = (Math.round(i.quantity < 1 ? 1 * 100 : i.quantity * 100) / 100).toFixed(2);
        html += `<tr class="text-center">
                    <td class="product-remove"><button class='en-btn px-1 px-md-3' data-id=${i.id}>Remove</button></td>
                    
                    <td class="image-prod"><div class="img" style="background-image:url(img/${i.img.src});"></div></td>
                    
                    <td class="product-name">
                        <h3>${i.name}</h3>
                    </td>
                    
                    <td class="price">$${i.price.new}</td>
                    
                    <td class="quantity">
                        <div class="input-group mb-3">
                        <input type="number" name="quantity"  data-id=${i.id} class="quantity form-control input-number" value="${i.quantity}" min="1" max="100">
                        </div>
                    </td>
                    
                    <td class="total">$${(i.price.new * altQty)}</td>
                </tr>`;
                total += i.price.new * altQty;
    }
    deliver = total > 100 ? 0 : 3;
    html += "</tbody></table>";
    $('#cart').html(html);
    $('#delivery').html("<span>Delivery</span>$" + deliver);
    $('#totalPrice').html("<span>Total</span>$" + (total + deliver).toFixed(2));
    $('.quantity').blur(function(){
        if(parseInt($(this).val()) < 1){
            $(this).val(1);
        }
        products.filter(x => x.id == $(this).data('id'))[0].quantity = parseInt($(this).val());
        setLS("cart", products);
        showCart();
    });
    $('.en-btn').click(function(){
        removeFromCart($(this).data('id'));
    });
}
function removeFromCart(id) {
    let products = getLS("cart");
    let filtered = products.filter(p => p.id != id);
    setLS("cart", filtered);
    showCart();
}
$('#goTo').click(function(){
    setLS("total", total={total: total, deliver : deliver});
    window.location.href = "checkout.html";
});
let regName = /^([A-Z][a-z]{2,15}){1,5}(\s[A-Z][a-z]{2,15}){1,5}$/;
let messageName = "Please enter your name ex. David Beckam";
let regEmail = /^[a-z][\w\-\.]+\@[a-z0-9]{2,15}(\.[a-z]{2,4})?\.[a-z]{2,4}$/;
let messageEmail = "Please enter your email ex. email@gmail.com";
let regAdress = /^([A-Z][a-z]{2,50}|\d{1,5})(\s([A-Z]*[a-z]{2,50}|\d{1,5}))*$/;
let messageAdress = "Please enter your adress ex. Wiliam 43 street";
let regPhone=/^\+\d{2,3}\s?\d{3,4}\s?\d{3,4}(\s?\d{3,4})?$/;
let messagePhone = "Please enter your phone in format +(xxx) xxx xxx";
let regTown = /^[A-Z][a-z]{2,30}(\s[A-Z][a-z]{2,30}){0,3}$/;
let messageTown = "Please enter your city oe town ex. London";
let regPostCode = /^\d{2}\s?\d{3}$/;
let postCodeMessage = "Pleasse enter your post code ex. 78 541";
let regText = /^([\w\.\-\s]{10,150})+$/;
$('#checkout').click(function(){
    let selected = $('#state option:selected').val();
    let payment = $("input[name='optradio']:checked").length;
    formCheck($('#name').val(), regName,"name", messageName);
    formCheck($('#email').val(), regEmail,"email", messageEmail);
    formCheck($('#adress').val(), regAdress, "adress", messageAdress);
    formCheck($('#phone').val(), regPhone, "phone", messagePhone);
    formCheck($('#town').val(), regTown, "town", messageTown);
    formCheck($('#post-code').val(), regPostCode, "post-code", postCodeMessage);
    formCheck(selected, selected == 0 ? "false" : selected, "state", "Please select state");
    formCheck("payment", payment == 0 ? "false" : "payment", "payment", "Please select payment method");
    if(errors.length == 0){
        removeLS("cart");
        removeLS("total");
        $('#checkout-form').trigger("reset");
        $('#checkout').after("<p class='help-block text-success' id='pass'>Your order has been sent successfuly, you can expect it in 2-4 days. Thank you for your ourchase :)</p>");
        errors = [];
    }
});
$('#send-message').click(function(){
    formCheck($('#name-contact').val(), regName,"name-contact", messageName);
    formCheck($('#email-contact').val(), regEmail,"email-contact", messageEmail);
    formCheck($('#phone-contact').val(), regPhone, "phone-contact", messagePhone);
    formCheck($('#message-contact').val(), regText, "message-contact", "Please enter message");
    if(errors.length == 0){
        $('#contact-form').trigger("reset");
        $('#send-message').after("<p class='help-block text-success' id='pass'>Your message has been sent, we will answer asap :)</p>");
        errors = [];
    }
});



function addedToCartMessage() {
    var x = document.getElementById("snackbar");
    x.innerHTML = "Product added to cart";
    x.className = "show";
    setTimeout(function(){ x.className = x.className.replace("show", ""); }, 3000);
}



function formCheck(val, reg, id, message){
    if(val.match(reg)){
        $(`#message-${id}`).fadeOut();
        if(errors.indexOf(id) > -1) errors.splice(errors.indexOf(id), 1);
        return true;
    }
    else{
        $('#pass').fadeOut();
        if($(`#message-${id}`).is(":visible")) return;
        $(`#${id}`).after(`<p class='help-block text-danger mb-0' id='message-${id}'>${message}</p>`);
        errors.push(id);
    }
}