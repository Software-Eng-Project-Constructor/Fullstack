only owner and admin role members can do following:
    to add teammembers post to /api/team/
    {"projectId":[projectid] ,"email":[email of user to add],"role":[role of user to add]}

    to delete team mmember delete on /api/team/[projectid]/[memberid]

    to edit teammembers post to /api/team/ with existing email. this will automatically redirect to editing user in teamMembers table.
Any member can do following:
    to get team members get on /api/team/[projectid]