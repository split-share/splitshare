import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitizes HTML content to prevent XSS attacks.
 * Allows safe HTML tags commonly used in rich text editors.
 */
export function sanitizeHtml(html: string): string {
	return DOMPurify.sanitize(html, {
		ALLOWED_TAGS: [
			'p',
			'br',
			'strong',
			'b',
			'em',
			'i',
			'u',
			's',
			'strike',
			'code',
			'pre',
			'blockquote',
			'ul',
			'ol',
			'li',
			'h1',
			'h2',
			'h3',
			'h4',
			'h5',
			'h6',
			'a',
			'span',
			'div'
		],
		ALLOWED_ATTR: ['href', 'target', 'rel', 'class'],
		ALLOW_DATA_ATTR: false,
		ADD_ATTR: ['target'],
		FORBID_TAGS: ['script', 'style', 'iframe', 'form', 'input', 'object', 'embed'],
		FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur']
	});
}
