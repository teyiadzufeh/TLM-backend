const MSG_TYPES = Object.freeze({
	ACCOUNT_CREATED: 'Account Successfully Created.',
	POST_CREATED: 'Post created successfully',
	LOGGED_IN: 'Successfully logged in',
	DELETED: 'Resource Deleted Successfully',
	UPDATED: 'Resource Updated Successfully',
	CREATED: 'Resource Created Successfully',
	FETCHED: 'Resource Fetched Successfully',
	ACCOUNT_VERIFIED: 'Account Successfully Verified',
	POST_FOUND: 'Post fetched successfully',
	POSTS_FOUND: 'Posts fetched successfully',
	AWAIT_ADMIN:
		'Account successfully verified. Awaiting administrator verification.',
	ACCOUNT_EXIST: 'Account already exist.',
	ACCOUNT_INVALID: 'Invalid email or password',
	SUSPENDED: 'Account is suspended!',
	INACTIVE: 'Account is inactive!',
	DISABLED: 'Account is disabled!',
	NOT_FOUND: 'Not Found',
	CATEGORY_NOT_FOUND: 'Category Not Found, Baba',
	RESET_MAIL_SENT: 'Reset Mail Sent',
	PASSWORD_RESET: 'Password Successfully Reset',
	UPLOAD_IMAGE: 'Image upload is required.',
	ENTERPRISE_LOGO: 'Enterprise Logo is required.',
	ACCESS_DENIED: 'Access denied.',
	SESSION_EXPIRED: 'Access denied. Your session has expired',
	DEACTIVATED: "Your account isn't activate",
	PERMISSION: "You don't have enough permission to perform this action",
	SERVER_ERROR: 'Server Error!',
	FREEMIUM: 'No pricing found.',
	FAILED_SUPPORT:
		"We currently don't have support for this location. Please contact our support for assistance",
	ACCOUNT_DELETED: 'Account no longer exists!',
	INVALID_PASSWORD: 'Invalid Password',
	COMPANY_ACCEPT:
		"You've successfully accepted this Order. Please Asign a rider to this order immedaitely.",
	VEHICLE_NOT_SUPPORTED:
		"You currently don't have support for this vehicle Type so you can't accept this order.",
	RIDER_ASSIGN: 'Order sent to riders.',
	RIDER_ACCEPTED: "You've successfully accepted this order",
	RIDER_REJECTED: "You've successfully rejected this order",
	PROCEED_TO_PICKUP: 'Proceeding to pickup location',
	PICKED_UP: 'Item successfully picked up.',
	ARRIVED_AT_PICKUP: 'Arrival at pickup location confirmed',
	ARRIVED_AT_DELIVERY: 'Arrival at delivery location confirmed',
	PROCEED_TO_DELIVERY: 'Proceeding to delivery location',
	RATING_DONE: 'Rating submitted successfully.',
	RATING_EXIST: 'Rating exists.',
	RATING_RETRIEVED: 'Rating retrieved successfully.',
	NO_ENTERPRISE: 'No Enterprise account was found',
	WALLET_FUNDED: 'Your wallet has been funded',
	CREDIT_FUNDED: 'Enterprise credit account funded successfully',
	NOT_ALLOWED: 'This operation is not allowed',
	PAYMENT_ERROR: 'Payment error - card charging failed',
	APPROVED: 'Resource approved successfully',
	CODE_EXPIRED: 'Code has expired',
	INVALID_TOKEN: 'Invalid token.',
	WRONG_TOKEN: 'Wrong user token. Access denied'
});

const USER_TYPES = Object.freeze({
	LOGISTAT: 'logistat',
	TENANT: 'tenant',
});

const USER_ROLES = Object.freeze({
	SUPER_ADMIN: 'superadmin',
	ADMIN: 'admin',
	BRANCH_ADMIN: 'branchadmin',
	USER: 'user',
	RIDER: 'rider',
});

module.exports = {
	MSG_TYPES,
	USER_TYPES,
	USER_ROLES
};
