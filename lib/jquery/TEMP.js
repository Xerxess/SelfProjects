/**
 * @fileOverview jquery 编写兼容 require
 * @author 
 * @date 
 * @version
 */
(function( factory ) {
  if ( typeof define === "function" && define.amd ) {
    define( ["jquery"], factory );
  } else if (typeof module === "object" && module.exports) {
    module.exports = factory( require( "jquery" ) );
  } else {
    factory( jQuery );
  }
}(function( $ ) {
}));