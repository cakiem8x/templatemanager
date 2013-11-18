module.exports = function(template, membershipIds) {
    if (template.free) {
        return true;
    }

    for (var i in membershipIds) {
        if (template.memberships && template.memberships.indexOf(membershipIds[i]) != -1) {
            return true;
        }
    }

    return false;
};