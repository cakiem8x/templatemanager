/**
 * Templates/Extensions manager. Powered by MEAN stack
 *
 * @link    http://github.com/nghuuphuoc/templatemanager
 * @author  http://twitter.com/nghuuphuoc
 */

module.exports = function(package, membershipIds) {
    if (package.free) {
        return true;
    }

    for (var i in membershipIds) {
        if (package.memberships && package.memberships.indexOf(membershipIds[i]) != -1) {
            return true;
        }
    }

    return false;
};