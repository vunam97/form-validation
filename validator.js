
function Validator(options) {
    function getParent(element, selector) {
        while(element.parentElement) {
            if(element.parentElement.matches(selector)) {
                return element.parentElement;
            }
            element = element.parentElement;
        }
    }
    
    var selectorRules = {};

    // hàm thực hiện validate
    function validate (inputElement, rule){
        var errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector);
        var errorMessage;

        // Lấy ra các rules của selector
        var rules = selectorRules[rule.selector];

        // lặp qua từng rule và kiểm tra
        // Nếu có lỗi thì dừng kiêm tra
        for(var i = 0; i < rules.length; ++i){
            switch(inputElement.type) {
                case 'radio':
                case 'checkbox':
                    errorMessage =  rules[i](
                        formElement.querySelector(rule.selector + ':checked')
                    );
                    break;
                default:
                    errorMessage =  rules[i](inputElement.value);
            }
            if(errorMessage) break;
        }

        if(errorMessage){
            errorElement.innerText = errorMessage;
            getParent(inputElement, options.formGroupSelector).classList.add('invalid');
        }else{
            errorElement.innerText = '';
            getParent(inputElement, options.formGroupSelector).classList.remove('invalid');
        }

        return !errorMessage;
    }

    // Lấy element của form cần validate
    var formElement = document.querySelector(options.form);   
    if(formElement){
        // Khi submit form
        formElement.onsubmit = function(e){
            e.preventDefault();

            var isFormValid = true;

            // Lặp qua từng rule và validate
            options.rules.forEach(function(rule){
                var inputElement = formElement.querySelector(rule.selector);
                var isValid = validate(inputElement, rule);
                if(!isValid){
                    isFormValid = false;
                }
            });

            if(isFormValid){
                if(typeof options.onSubmit === 'function'){
                    var enableInputs = formElement.querySelectorAll('[name]')
            
                var formValues = Array.from(enableInputs).reduce(function(values, input){
                    switch(input.type){
                        case 'radio':
                        case ' checkbox':
                            values[input.name] = formElement.querySelector('input[name="' + input.name + '"]:checked').value;
                            break;
                        default:
                            values[input.name] = input.value;
                    }
                    return values;
                }, {});
                    options.onSubmit(formValues);
                }
            }

        }

        // Lặp qua mỗi rules và xử lý(lắng gnhe sự kiện blur, input, ...)
        options.rules.forEach(function (rule){

            // Lưu lai các rules của mỗi input
            if(Array.isArray(selectorRules[rule.selector])) {
                selectorRules[rule.selector].push(rule.test);
            }else{
                selectorRules[rule.selector] = [rule.test];
            }

            var inputElements = formElement.querySelectorAll(rule.selector);
            Array.from(inputElements).forEach(function(inputElement){
                // Xử lý khi blur ra khỏi input
                inputElement.onblur = function() {
                    validate(inputElement, rule);
                }

                // Xử lý khi người dùng nhập input vào
                inputElement.oninput = function() {
                    var errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector);
                    errorElement.innerText = '';
                    getParent(inputElement, options.formGroupSelector).classList.remove('invalid');
                }
            });
        })
    }
}

Validator.isRequired = function(selector, mesage) {
    return {
        selector: selector,
        test: function(value) {
            return value ? undefined : mesage || 'Vui lòng nhập trường này';
        }
    }

}

Validator.isEmail = function(selector, mesage) {
    return {
        selector: selector,
        test: function(value) {
            var regex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
            return regex.test(value) ? undefined : mesage || 'Trường này phải là email';
        }
    }
}

Validator.minLength = function(selector, min, mesage) {
    return {
        selector: selector,
        test: function(value) {

            return value.length >= min ? undefined : mesage || `Vui lòng nhập tối thiểu ${min} ký tự`;
        }
    }
}

Validator.isConfirmed = function (selector, getConfirmValue, mesage) {
    return {
        selector: selector,
        test: function(value) {
            return value === getConfirmValue() ? undefined : mesage || 'Giá trị nhập vào không chính xác';
        }
    }
}
